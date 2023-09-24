const express = require("express");
const {
  addProductTowishlist,
  removeProductFromWishList,
  getLoggedUserWishList,
} = require("../controllers/wishListController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));
router.route("/").post(addProductTowishlist).get(getLoggedUserWishList);
router.delete("/:productId", removeProductFromWishList);

module.exports = router;
