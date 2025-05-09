const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateBody, schemas } = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post("/signup", validateBody(schemas.userCreate), authController.signup);
router.post("/login", validateBody(schemas.userLogin), authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protected routes
router.use(protect);
router.get("/me", authController.getMe);
router.post("/logout", authController.logout);
router.patch("/update-password", authController.updatePassword);

module.exports = router;
