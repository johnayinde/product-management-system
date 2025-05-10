const express = require("express");
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateBody, schemas } = require("../middleware/validation");

const router = express.Router();

router.get("/verify-payment", orderController.verifyPayment);
router.post("/webhook", orderController.handlePaymentWebhook);

// Protected routes
router.use(protect);

router.post(
  "/",
  validateBody(schemas.orderCreate),
  orderController.createOrder
);

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrder);
router.post("/:id/cancel", orderController.cancelOrder);

router.patch(
  "/:id/status",
  restrictTo("admin"),
  orderController.updateOrderStatus
);

router.get("/stats/all", restrictTo("admin"), orderController.getOrderStats);

module.exports = router;
