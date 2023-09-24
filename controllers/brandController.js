// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const Brand = require("../models/brandModel");
const handlerFactory = require("./handlerFactory");
const { uploadSingleImage } = require("../middleware/upoaldImageMiddleware");

exports.uploadBrandImage = uploadSingleImage("image");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file);
  const filename = `brands-${uuidv4()}-${Date.now()}-jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);
    req.body.image = filename;
  }
  next();
});

//@Desc   Get list Of Brands
//@Route  Get /api/v1/brands
//access  Public
exports.getAllBrands = handlerFactory.getAll(Brand);
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 5;
// const skip = (page - 1) * limit;

//@Desc   Create Brand
//@Route  Post /api/v1/brands
//access  Private
exports.CreateBrand = handlerFactory.createOne(Brand);

//@desc  Get One brand
//@Route Get /api/v1/brands/:id
//@access public

exports.getBrand = handlerFactory.getOne(Brand);
//@desc  Update Brand
//@route Put /api/v1/brands/:id
//@access Private

exports.updateBrand = handlerFactory.updateOne(Brand);
//@desc   Delete Specific Brand
//@Route  Delete api/v1/brands/:id
//@access Private
exports.deleteBtand = handlerFactory.deleteOne(Brand);
