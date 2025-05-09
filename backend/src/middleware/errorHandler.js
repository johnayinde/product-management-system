const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

/**
 * Convert mongoose validation error to ApiError
 * @param {Error} err - Mongoose validation error
 * @returns {ApiError} API error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

/**
 * Convert mongoose duplicate key error to ApiError
 * @param {Error} err - Mongoose duplicate key error
 * @returns {ApiError} API error
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(message, 400);
};

/**
 * Convert mongoose cast error to ApiError
 * @param {Error} err - Mongoose cast error
 * @returns {ApiError} API error
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(message, 400);
};

/**
 * Handle JWT errors
 * @param {Error} err - JWT error
 * @returns {ApiError} API error
 */
const handleJWTError = () =>
  new ApiError("Invalid token. Please log in again!", 401);

/**
 * Handle JWT expired error
 * @returns {ApiError} API error
 */
const handleJWTExpiredError = () =>
  new ApiError("Your token has expired! Please log in again.", 401);

/**
 * Send error response in development environment
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production environment
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * Global error handler middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
