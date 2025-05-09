const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An order must belong to a user"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Order item must have a product reference"],
        },
        name: String,
        quantity: {
          type: Number,
          required: [true, "Order item must have a quantity"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Order item must have a price"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "An order must have a total amount"],
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Shipping address must have a street"],
      },
      city: {
        type: String,
        required: [true, "Shipping address must have a city"],
      },
      state: {
        type: String,
        required: [true, "Shipping address must have a state"],
      },
      zipCode: {
        type: String,
        required: [true, "Shipping address must have a zipCode"],
      },
      country: {
        type: String,
        required: [true, "Shipping address must have a country"],
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "processing", "shipped", "delivered", "cancelled"],
        message:
          "Status must be one of: pending, processing, shipped, delivered, cancelled",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["paystack", "card"],
        message: "Payment method must be one of: paystack, card",
      },
      default: "paystack",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed"],
        message: "Payment status must be one of: pending, paid, failed",
      },
      default: "pending",
    },
    paymentDetails: {
      transactionId: String,
      paymentDate: Date,
      authorizationUrl: String,
      reference: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for commonly queried fields
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "paymentDetails.reference": 1 });

// Populate user and products when querying orders
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  }).populate({
    path: "products.product",
    select: "name price imageUrl",
  });
  next();
});

// Calculate total amount before saving
orderSchema.pre("save", function (next) {
  if (!this.isModified("products")) return next();

  this.totalAmount = this.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
