const express = require("express");
const {
  getAllSubCategories,
  createSubcategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require("../controllers/subCategoryController");
const {
  getSubCategoryValidator,
  createSubCategoryVAlidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getAllSubCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryVAlidator,
    createSubcategory
  );
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );
module.exports = router;
