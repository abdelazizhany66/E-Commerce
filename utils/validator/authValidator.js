const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("E-mail is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .custom((val) => {
      User.findOne({ email: val }).then((email) => {
        if (email) {
          return Promise.reject(new Error("email is already in user"));
        }
      });
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("password Confirm is required"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error(" passord confirm incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.loginValidator = [
  check("email").notEmpty().withMessage("please enter a email address"),
  check("password").notEmpty().withMessage("please enter a password"),
  validatorMiddleware,
];
