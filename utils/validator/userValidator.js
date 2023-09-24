const { check } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");

const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID"),
  validatorMiddleware,
];

exports.createUserValidattor = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("too short name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("please enter a valid email")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error(
              "this email is already in use please enater another email"
            )
          );
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invail phone number only accepted for EG and SA"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom((password, { req }) => {
      if (req.body.passwordConfirm !== password) {
        throw new Error("password confirm incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid Email must be using valid email")
    .custom((val) => {
      User.findOne({ email: val }).then((email) => {
        if (email) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      });
    }),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invail phone number only accepted for EG and SA"),
  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID"),
  validatorMiddleware,
];
exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User ID"),
  check("currentPassword")
    .notEmpty()
    .withMessage("current password is required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("no user with this id ");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("the current password is incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("newPasswordConfirm is required"),
  check("password")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 6 })
    .withMessage("password at least 6 characters")
    .custom(async (val, { req }) => {
      if (req.body.passwordConfirm !== val) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("invalid Email must be using valid email")
    .custom((val) => {
      User.findOne({ email: val }).then((email) => {
        if (email) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      });
    }),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invail phone number only accepted for EG and SA"),

  validatorMiddleware,
];
