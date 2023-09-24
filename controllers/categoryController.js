// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const handlerFactory = require("./handlerFactory");
const { uploadSingleImage } = require("../middleware/upoaldImageMiddleware");
const Category = require("../models/categoryModel");

exports.uploadCategoryImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file);
  if (req.file) {
    req.body.image = `category-${uuidv4()}-${Date.now()}-jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${req.body.image}`);
  }
  next();
});

//@desc    Get List Of Categories
//@route   Get /api/v1/categories
//@access  Public
exports.getAllCategories = handlerFactory.getAll(Category);

//@desc    Create Category
//@route   post /api/v1/categories
//@access  Private
exports.createCategory = handlerFactory.createOne(Category);

//@desc    Get One Category
//@route   Get /api/v1/categories
//@access  Public
exports.getCategory = handlerFactory.getOne(Category);
//@desc    Update Category
//@route   Put /api/v1/categories
//@access  Private
exports.UpdateCategory = handlerFactory.updateOne(Category);

//@desc   Delete Category
//@route  Delete /api/v1/categories
//@access Private
exports.deleteCategory = handlerFactory.deleteOne(Category);
