const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddelware = require("../../middleware/validatorMiddleware");
const { request } = require("express");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id "),
  validatorMiddelware,
];

exports.createSubCategoryVAlidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub Category must be have a name")
    .isLength({ min: 2 })
    .withMessage("Too short subCategory must be at least 2 characters ")
    .isLength({ max: 32 })
    .withMessage("Too long Sub Category must be at long 32 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddelware,
];
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddelware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid subcategory id"),
  validatorMiddelware,
];
