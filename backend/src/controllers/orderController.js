const axios = require("axios");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * Create new order and initialize payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress } = req.body;

    // Validate products and check stock
    const orderItems = [];
    let totalAmount = 0;

    const TAX_RATE = 0.1;
    const SHIPPING_COST = totalAmount > 50 ? 0 : 10;

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return next(
          new ApiError(`Product not found with ID: ${item.productId}`, 404)
        );
      }

      if (!product.isInStock(item.quantity)) {
        return next(
          new ApiError(
            `Not enough stock for product: ${product.name}. Available: ${product.quantity}`,
            400
          )
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        totalPrice: item.totalPrice,
      });

      totalAmount += product.price * item.quantity;
    }
    const taxAmount = totalAmount * TAX_RATE;
    const finalAmount = totalAmount + taxAmount + SHIPPING_COST;

    const order = await Order.create({
      user: req.user._id,
      products: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "pending",
    });

    // Initialize Paystack payment
    const paystack = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const reference = `order_${order._id}_${Date.now()}`;
    const callbackUrl = `${process.env.FRONTEND_URL}/orders/confirm/?reference=${reference}`;

    const paystackResponse = await paystack.post("/transaction/initialize", {
      email: req.user.email,
      amount: Math.round(finalAmount * 100),
      reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Update order with payment details
    order.paymentDetails = {
      reference,
      authorizationUrl: paystackResponse?.data?.data?.authorization_url,
    };

    await order.save();

    res.status(201).json(
      ApiResponse.success("Order created successfully", {
        order,
        paymentUrl: paystackResponse?.data?.data?.authorization_url,
      })
    );
  } catch (error) {
    logger.error("Error creating order:", error);
    next(new ApiError("Error creating order", 500));
  }
};

/**
 * Verify payment webhook
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;

    // Verify payment with Paystack
    const paystack = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const paystackResponse = await paystack.get(
      `/transaction/verify/${reference}`
    );
    // console.log("DATA>>", paystackResponse.data.data);

    // Check if payment was successful
    if (paystackResponse.data.data.status !== "success") {
      return next(new ApiError("Payment was not successful", 400));
    }

    const order = await Order.findOne({
      "paymentDetails.reference": reference,
    });

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    // Update order status and payment details
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paymentDetails.transactionId = paystackResponse.data.data.id;
    order.paymentDetails.paymentDate = new Date();

    await order.save();

    // Update product quantities
    for (const item of order.products) {
      const product = await Product.findById(item.product);

      if (product) {
        product.updateStock(item.quantity);
        await product.save();
      }
    }

    res
      .status(200)
      .json(ApiResponse.success("Payment verified successfully", { order }));
  } catch (error) {
    console.log(error);

    logger.error("Error verifying payment:", error);
    next(new ApiError("Error verifying payment", 500));
  }
};

/**
 * Handle payment webhook
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.handlePaymentWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature from Paystack
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return next(new ApiError("Invalid webhook signature", 400));
    }

    const event = req.body;

    // Handle different event types
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Find order by reference
      const order = await Order.findOne({
        "paymentDetails.reference": reference,
      });

      if (!order) {
        return next(new ApiError("Order not found", 404));
      }

      // Update order status and payment details
      order.paymentStatus = "paid";
      order.status = "processing";
      order.paymentDetails.transactionId = event.data.id;
      order.paymentDetails.paymentDate = new Date();

      await order.save();

      // Update product quantities
      for (const item of order.products) {
        const product = await Product.findById(item.product);

        if (product) {
          product.updateStock(item.quantity);
          await product.save();
        }
      }
    } else if (event.event === "charge.failed") {
      const reference = event.data.reference;

      // Find order by reference
      const order = await Order.findOne({
        "paymentDetails.reference": reference,
      });

      if (order) {
        order.paymentStatus = "failed";
        await order.save();
      }
    }

    // Always respond with 200 OK to webhook
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Error handling webhook:", error);
    res.status(200).json({ received: true });
  }
};

/**
 * Get all orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    // For admin: all orders, for user: only their orders
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = Order.find(filter);

    // Apply filters
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    if (req.query.paymentStatus) {
      query = query.find({ paymentStatus: req.query.paymentStatus });
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Execute query with pagination
    const orders = await query.skip(skip).limit(limit);

    // Get total count
    const total = await Order.countDocuments(filter);

    res.status(200).json(
      ApiResponse.success("Orders retrieved successfully", {
        results: orders.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        orders,
      })
    );
  } catch (error) {
    logger.error("Error getting orders:", error);
    next(new ApiError("Error getting orders", 500));
  }
};

/**
 * Get order by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    // Check if user is owner or admin
    if (req.user.role !== "admin" && order.user.id !== req.user.id) {
      return next(
        new ApiError("You do not have permission to view this order", 403)
      );
    }

    res
      .status(200)
      .json(ApiResponse.success("Order retrieved successfully", { order }));
  } catch (error) {
    logger.error("Error getting order:", error);
    next(new ApiError("Error getting order", 500));
  }
};

/**
 * Update order status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    // Only admin can update order status
    if (req.user.role !== "admin") {
      return next(
        new ApiError("You do not have permission to update order status", 403)
      );
    }

    const { status } = req.body;

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return next(new ApiError("Invalid order status", 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    // If order is being cancelled and was paid
    if (status === "cancelled" && order.paymentStatus === "paid") {
      logger.info(`Order ${order._id} cancelled.`);
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json(
        ApiResponse.success("Order status updated successfully", { order })
      );
  } catch (error) {
    logger.error("Error updating order status:", error);
    next(new ApiError("Error updating order status", 500));
  }
};

/**
 * Cancel order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    // Check if user is owner or admin
    if (req.user.role !== "admin" && order.user.id !== req.user.id) {
      return next(
        new ApiError("You do not have permission to cancel this order", 403)
      );
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return next(
        new ApiError(`Order cannot be cancelled in ${order.status} status`, 400)
      );
    }

    // Cancel order
    order.status = "cancelled";
    await order.save();

    // If order was paid, handle refund logic here
    if (order.paymentStatus === "paid") {
      logger.info(`Order ${order._id} cancelled.`);
    }

    res
      .status(200)
      .json(ApiResponse.success("Order cancelled successfully", { order }));
  } catch (error) {
    logger.error("Error cancelling order:", error);
    next(new ApiError("Error cancelling order", 500));
  }
};

/**
 * Get order statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getOrderStats = async (req, res, next) => {
  try {
    // Only admin can view order statistics
    if (req.user.role !== "admin") {
      return next(
        new ApiError("You do not have permission to view order statistics", 403)
      );
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: {
            status: "$status",
            paymentStatus: "$paymentStatus",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.status": 1, "_id.paymentStatus": 1 },
      },
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json(
      ApiResponse.success("Order statistics retrieved successfully", {
        stats,
        monthlyRevenue,
      })
    );
  } catch (error) {
    logger.error("Error getting order stats:", error);
    next(new ApiError("Error getting order statistics", 500));
  }
};
