const express = require("express");
const {
  getAllBrands,
  CreateBrand,
  getBrand,
  updateBrand,
  deleteBtand,
  uploadBrandImage,
  resizeImage,
} = require("../controllers/brandController");
const {
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
} = require("../utils/validator/brandValidator");

const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(getAllBrands)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    CreateBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteBrandValidator,
    deleteBtand
  );

module.exports = router;
