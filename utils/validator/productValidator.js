const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("product Title is required")
    .isLength({ min: 3 })
    .withMessage("Too short product title ")
    .isLength({ max: 100 })
    .withMessage("Too long product title")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product Description is required")
    .isLength({ min: 10 })
    .withMessage("Too short Product Description"),
  check("sold").optional().isNumeric().withMessage("must be a number"),
  check("quantity").notEmpty().withMessage("product quantity is required"),
  check("price")
    .notEmpty()
    .withMessage("product price is required")
    .isNumeric()
    .withMessage("Price After Discount must be a number")
    .isFloat()
    .isLength({ max: 20 })
    .withMessage("Too long Product Price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price After Discount must be a number")
    .isFloat()
    .custom((val, { req }) => {
      if (req.body.price <= val) {
        throw new Error("price after discount must be above current price");
      }
      return true;
    }),
  check("rating")
    .optional()
    .isNumeric()
    .withMessage("Product rating must be a number")
    .isFloat()
    .isLength({ min: 1 })
    .withMessage("Rating must be a belong or equle 1")
    .isLength({ max: 5 })
    .withMessage("Rating must be a below or equle 5"),
  check("ratingQuantity")
    .optional()
    .isNumeric()
    .withMessage("Rating must be a number"),
  check("color")
    .optional()
    .isArray()
    .withMessage("Color should be array of string"),
  check("imageCover").notEmpty().withMessage("Image Cover is required"),
  check("image")
    .optional()
    .isArray()
    .withMessage("product Image should be array of string "),
  check("category")
    .notEmpty()
    .withMessage("Product Must be belong to category")
    .isMongoId()
    .withMessage("invalid category id")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`no Category for this id ${categoryId}`)
          );
        }
      })
    ),
  check("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id format")
    .custom((subcategoryIds) =>
      SubCategory.find({
        _id: { $exists: true, $in: subcategoryIds },
      }).then((result) => {
        if (result < 1 || result.length !== subcategoryIds.length) {
          return Promise.reject(new Error(`Invalid category Id`));
        }
      })
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCategoryInDB = [];
          subCategories.forEach((subCategory) => {
            subCategoryInDB.push(subCategory._id);
          });
          if (!val.every((v) => subCategoryInDB.includes(v))) {
            return Promise.reject(
              new Error("subCtegory not belong to category")
            );
          }
        }
      )
    ),
  check("brand").optional().isMongoId().withMessage("Invalid Id format"),
  validatorMiddleware,
];
exports.getProductValidator = [
  check("id").isMongoId().withMessage("invalid Product id "),
  validatorMiddleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("invalid Product id "),
  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("invalid Product id "),
  validatorMiddleware,
];
