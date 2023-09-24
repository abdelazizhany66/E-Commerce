const express = require("express");
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdToBody,
} = require("../controllers/reviewController");
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getAllReviews)
  .post(
    authController.protect,
    authController.allowedTo("user"),
    setProductIdToBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authController.protect,
    authController.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authController.protect,
    authController.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
