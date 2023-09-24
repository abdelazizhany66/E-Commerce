const express = require("express");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryValidator");

const {
  getAllCategories,
  createCategory,
  getCategory,
  UpdateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../controllers/categoryController");
const subCategoryRoute = require("./subCategoryRoute");
const authController = require("../controllers/authController");

const router = express.Router();
//@desc Nested Route
router.use("/:categoryId/subcategories", subCategoryRoute);

router
  .route("/")
  .get(getAllCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    UpdateCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
