const express = require("express");
const {
  addProductToCart,
  removeProductFromCart,
  getAllProductFromCart,
  deleteCart,
  updateQuantityProduct,
  applyCoupon,
} = require("../controllers/cartController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getAllProductFromCart)
  .delete(deleteCart);
router.get("/applycoupon", applyCoupon);
router.route("/:itemId").put(updateQuantityProduct).put(removeProductFromCart);

module.exports = router;
