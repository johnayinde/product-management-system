const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
      minlength: [2, "A product name must have at least 2 characters"],
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
      trim: true,
      minlength: [10, "A product description must have at least 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be a positive number"],
    },
    quantity: {
      type: Number,
      required: [true, "Product must have a quantity"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Product must belong to a user"],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for commonly queried fields
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

// => Pre-Hooks

// Only find active products
productSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Populate user when querying products
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "name",
  });
  next();
});

/**
 * Check if product is in stock
 * @param {number} quantity - Quantity to check
 * @returns {boolean} True if product is in stock
 */
productSchema.methods.isInStock = function (quantity) {
  return this.quantity >= quantity;
};

/**
 * Update product stock
 * @param {number} quantity - Quantity to reduce
 * @returns {number} Updated quantity
 */
productSchema.methods.updateStock = function (quantity) {
  this.quantity -= quantity;
  return this.quantity;
};

/**
 * Virtual for checking if product is out of stock
 */
productSchema.virtual("outOfStock").get(function () {
  return this.quantity <= 0;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
