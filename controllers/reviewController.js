const handelerfactory = require("./handlerFactory");
const Review = require("../models/reviewModel");

//@desc  get all reviews
//route  get /api/v1/reviews
//@access Public
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.filterObj) filterObj = { product: req.params.productId };
  req.filterObj = filterObj;
  next();
};
exports.getAllReviews = handelerfactory.getAll(Review);

//@desc  get specific review
//route  get /api/v1/reviews/:id
//@access private [user , admin , manager]
exports.getReview = handelerfactory.getOne(Review);

//@desc  create review
//route  post /api/v1/reviews
//@access private [user]
exports.setProductIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.createReview = handelerfactory.createOne(Review);

//@desc  update specific review
//route  get /api/v1/reviews/:id
//@access private [user]
exports.updateReview = handelerfactory.updateOne(Review);

//@desc  delete specific review
//route  delete /api/v1/reviews/:id
//@access private [admin,manger,user]
exports.deleteReview = handelerfactory.deleteOne(Review);
