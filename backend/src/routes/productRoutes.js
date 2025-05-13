const express = require("express");
const productController = require("../controllers/productController");
const { protect, restrictTo } = require("../middleware/auth");
const {
  validateBody,
  validateQuery,
  validateParams,
  schemas,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.get(
  "/",
  validateQuery(schemas.productQuery),
  productController.getAllProducts
);
router.get("/:id", productController.getProduct);

// Protected routes
router.use(protect);

// Stock check for order process
router.post("/check-stock", productController.checkProductStock);

// Admin only routes
router.post(
  "/",
  restrictTo("admin"),
  validateBody(schemas.productCreate),
  productController.createProduct
);

router.patch(
  "/:id",
  restrictTo("admin"),
  validateBody(schemas.productUpdate),
  productController.updateProduct
);

router.delete("/:id", restrictTo("admin"), productController.deleteProduct);
router.post(
  "/upload-images",
  restrictTo("admin"),
  productController.uploadProductImages
);

// Product statistics
router.get(
  "/stats/categories",
  restrictTo("admin"),
  productController.getProductStats
);

module.exports = router;
