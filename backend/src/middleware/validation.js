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
};
