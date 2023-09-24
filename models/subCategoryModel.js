const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory Must be have a name"],
      trim: true,
      unique: [true, "SubCategory must be unique name"],
      minlength: [2, "subCategory must be at least 2 characters"],
      maxlength: [32, "subCategory must be at least 32 characters"],
    },
    sulg: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to a category"],
    },
  },
  {
    timestamps: true,
  }
);
subCategorySchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name -_id",
  });
  next();
});
module.exports = new mongoose.model("SubCategory", subCategorySchema);
