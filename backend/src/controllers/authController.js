const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const ApiResponse = require("../utils/apiResponse");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  user.password = undefined;

  res.cookie("jwt", token, cookieOptions);

  return res.status(statusCode).json(
    ApiResponse.success("Success", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  );
};

exports.signup = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json(ApiResponse.error("Email already in use"));

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(ApiResponse.error("Please provide email and password"));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json(ApiResponse.error("Invalid email or password"));
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json(ApiResponse.error("Invalid email or password"));
  }

  createSendToken(user, 200, res);
};

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json(ApiResponse.success("Logged out successfully"));
};

exports.getMe = (req, res) => {
  res.status(200).json(
    ApiResponse.success("Success", {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    })
  );
};

/**
 * Update current user's password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordCorrect = await user.correctPassword(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect)
    return res
      .status(400)
      .json(ApiResponse.error("Your current password is incorrect"));

  if (newPassword !== passwordConfirm)
    return res
      .status(400)
      .json(ApiResponse.success("New passwords do not match"));

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
};

/**
 * Forgot password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(200)
      .json(ApiResponse.error("There is no user with that email address"));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send response
  res.status(200).json(
    ApiResponse.success("Reset token generated successfully", {
      resetToken,
      message: "",
    })
  );
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return res
      .status(200)
      .json(ApiResponse.error("Token is invalid or has expired"));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
};
