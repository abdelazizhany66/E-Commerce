const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("rating")
    .notEmpty()
    .withMessage("rating value is reuired")
    .isFloat({ min: 1, max: 5 })
    .withMessage("the rating value must be between 1 and 5"),
  check("user").isMongoId().withMessage("the user should be a mongo id "),
  check("product")
    .isMongoId()
    .withMessage("the product id incorrect ")
    .custom((val, { req }) =>
      Review.findOne({ user: req.user._id, product: req.body.product }).then(
        (review) => {
          // console.log(review);
          if (review) {
            return Promise.reject(
              new Error("you already review in this product before ")
            );
          }
          //   return true;
        }
      )
    ),
  validatorMiddleware,
];
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("invalid review id"),
  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id")
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error("no review with this id "));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("you are not ownerShip to this review")
          );
        }
        return true;
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id")
    .custom((val, { req }) => {
      //check if this user has already reviewed the review
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(new Error("no review in this id"));
          }
          // TODO: convert .toString() because return from object true from each because for each id   .toString() return true or false
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("you not allowed to delete this review ")
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
