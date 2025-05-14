const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

/**
 * Middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
exports.protect = async (req, res, next) => {
  // 1) Get token from headers or cookies
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json(
        ApiResponse.error("The user belonging to this token no longer exists.")
      );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

/**
 * Middleware to restrict routes to certain roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

/**
 * Middleware to set CSRF token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.setCsrfToken = (req, res, next) => {
  // Only in production
  if (process.env.NODE_ENV === "production") {
    res.cookie("XSRF-TOKEN", req.csrfToken(), {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  next();
};
