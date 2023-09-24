const express = require("express");
const {
  addAddress,
  removeAddress,
  getAddressLogedUser,
} = require("../controllers/addressController");
const { addAddressValidator } = require("../utils/validator/addressValidation");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));
router
  .route("/")
  .post(addAddressValidator, addAddress)
  .get(getAddressLogedUser);
router.delete("/:addressId", removeAddress);

module.exports = router;
