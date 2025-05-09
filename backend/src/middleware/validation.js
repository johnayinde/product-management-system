const Joi = require("joi");
const ApiError = require("../utils/apiError");

/**
 * Validate request body against schema
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      return next(new ApiError("Validation Error", 400, errorDetails));
    }

    next();
  };
};

/**
 * Validate request query against schema
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      return next(new ApiError("Validation Error", 400, errorDetails));
    }

    next();
  };
};

/**
 * Validate request params against schema
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Function} Express middleware
 */
exports.validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      return next(new ApiError("Validation Error", 400, errorDetails));
    }

    next();
  };
};

// Schemas for validation
exports.schemas = {
  userCreate: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    passwordConfirm: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
    role: Joi.string().valid("user", "admin").default("user"),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Product schemas
  productCreate: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    quantity: Joi.number().integer().min(0).required(),
    category: Joi.string().required(),
    imageUrl: Joi.string().uri().allow(""),
    featured: Joi.boolean().default(false),
  }),

  productUpdate: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().min(10).max(1000),
    price: Joi.number().positive().precision(2),
    quantity: Joi.number().integer().min(0),
    category: Joi.string(),
    imageUrl: Joi.string().uri().allow(""),
    featured: Joi.boolean(),
  }),

  productQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default("-createdAt"),
    search: Joi.string(),
    category: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    featured: Joi.boolean(),
  }).unknown(true),
};
