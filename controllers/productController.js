const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { uploadMixOfImage } = require("../middleware/upoaldImageMiddleware");
const handlerFactory = require("./handlerFactory");
const Product = require("../models/productModel");

exports.uploadProductImages = uploadMixOfImage([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //   console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  //1)imageCover
  if (req.file) {
    req.body.imageCover = `product-${uuidv4()}-${Date.now()}-cover-jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 92 })
      .toFile(`uploads/products/${req.body.imageCover}`);
  }

  //2)images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, index) => {
      const imageFileName = `product${
        index + 1
      }-${uuidv4()}-${Date.now()}-jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 92 })
        .toFile(`uploads/products/${imageFileName}`);

      req.body.images.push(imageFileName);
    })
  );
  next();
});

//@desc  Get list of product
//route  Get /api/v1/products
//access public
exports.getAllProducts = handlerFactory.getAll(Product, "Product");

//@desc create a new product
//@route Create /api/v1/products
//@access private
exports.createProduct = handlerFactory.createOne(Product);

//@desc Get Specific product
//@route Get /api/v1/products/:id
//@access public
exports.getProduct = handlerFactory.getOne(Product, "reviews");

//@desc    Updata Specific Product
//@route   Put /api/v1/product/:id
//@access  private
exports.updateProduct = handlerFactory.updateOne(Product);

//@desc    Delete Specific Product
//@route   delete /api/v1/product/:id
//@access  private
exports.deleteProduct = handlerFactory.deleteOne(Product);
