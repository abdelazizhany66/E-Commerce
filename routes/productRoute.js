const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productController");
const {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getProductValidator,
} = require("../utils/validator/productValidator");
const authController = require("../controllers/authController");
const reviewRoute = require("./reviewRoute");

const router = express.Router();

// /products/:producrId/reviews
router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(getAllProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
