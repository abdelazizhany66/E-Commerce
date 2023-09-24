const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "rating value must be at least 1"],
      max: [5, "rationg value must be at long 5"],
      required: [true, "rating value required"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "product value required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "user value required"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

reviewSchema.statics.calcAvarageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: productId,
        ratingAvg: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.legnth > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAvarage: result[0].ratingAvg,
      ratingQuantity: result[0].ratingQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAvarage: 0,
      ratingQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  // this points to current review
  await this.constructor.calcAvarageRating(this.product);
});
reviewSchema.post("remove", async function () {
  // this points to current review
  await this.constructor.calcAvarageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
