const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");
const multer = require("multer");
const upload = require("../utils/multer");
/**
 * Get all products with filtering, sorting, and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };

    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
          { category: { $regex: req.query.search, $options: "i" } },
        ],
      });
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;

    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.status(200).json(
      ApiResponse.success("Products retrieved successfully", {
        results: products.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        products,
      })
    );
  } catch (error) {
    logger.error("Error getting products:", error);
    next(new ApiError("Error getting products", 500));
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError("No product found with that ID", 404));
    }

    res
      .status(200)
      .json(ApiResponse.success("Product retrieved successfully", { product }));
  } catch (error) {
    logger.error("Error getting product:", error);
    next(new ApiError("Error getting product", 500));
  }
};

/**
 * Create new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const newProduct = await Product.create(req.body);
    res.status(201).json(
      ApiResponse.success("Product created successfully", {
        product: newProduct,
      })
    );
  } catch (error) {
    logger.error("Error creating product:", error);
    next(new ApiError("Error creating product", 500));
  }
};

/**
 * Update product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError("No product found with that ID", 404));
    }

    // Check if user is owner or admin
    if (req.user.role !== "admin" && product.createdBy.id !== req.user.id) {
      return next(
        new ApiError("You do not have permission to update this product", 403)
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(
      ApiResponse.success("Product updated successfully", {
        product: updatedProduct,
      })
    );
  } catch (error) {
    logger.error("Error updating product:", error);
    next(new ApiError("Error updating product", 500));
  }
};

/**
 * Delete product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError("No product found with that ID", 404));
    }

    if (req.user.role !== "admin" && product.createdBy.id !== req.user.id) {
      return next(
        new ApiError("You do not have permission to delete this product", 403)
      );
    }

    product.active = false; // soft delete
    await product.save({ validateBeforeSave: false });

    res.status(204).json(ApiResponse.success("Product deleted successfully"));
  } catch (error) {
    logger.error("Error deleting product:", error);
    next(new ApiError("Error deleting product", 500));
  }
};

/**
 * Get product statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getProductStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { active: { $ne: false } },
      },
      {
        $group: {
          _id: "$category",
          numProducts: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { numProducts: -1 },
      },
    ]);

    res.status(200).json(
      ApiResponse.success("Product statistics retrieved successfully", {
        stats,
      })
    );
  } catch (error) {
    logger.error("Error getting product stats:", error);
    next(new ApiError("Error getting product statistics", 500));
  }
};

/**
 * Check if product is in stock
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.checkProductStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ApiError("No product found with that ID", 404));
    }

    const isInStock = product.isInStock(quantity);

    res.status(200).json(
      ApiResponse.success("Stock check completed", {
        productId,
        quantity,
        inStock: isInStock,
        availableQuantity: product.quantity,
      })
    );
  } catch (error) {
    logger.error("Error checking product stock:", error);
    next(new ApiError("Error checking product stock", 500));
  }
};

exports.uploadProductImages = (req, res) => {
  upload(req, res, function (err) {
    try {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json(ApiResponse.error("Upload error", { message: err.message }));
      } else if (err) {
        return res
          .status(500)
          .json(ApiResponse.error("Server error", { message: err.message }));
      }

      // No files uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error("No images uploaded"));
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imageUrls = req.files.map(
        (file) => `${baseUrl}/uploads/products/${file.filename}`
      );

      return res
        .status(200)
        .json(
          ApiResponse.success("Images uploaded successfully", { imageUrls })
        );
    } catch (error) {
      logger.error("Error uploading image:", error);
      next(new ApiError("Error uploading image", 500));
    }
  });
};
