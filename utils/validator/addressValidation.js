const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.addAddressValidator = [
  check("alias")
    .optional()
    .custom((val, { req }) =>
      User.find(req.user._id).then((user) => {
        const aliassInDB = [];
        user.forEach((use) => {
          aliassInDB.push(use.addresses[0].alias);
        });
        if (aliassInDB.includes(val)) {
          return Promise.reject(new Error("zzzzzzzzzzzzzzzzzzzzz"));
        }
        // return true;
      })
    ),

  validatorMiddleware,
];
