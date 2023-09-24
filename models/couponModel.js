const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "coupone name is required"],
    unique: true,
  },
  expire: {
    type: Date,
    required: [true, "coupone expire is required"],
  },
  discount: {
    type: Number,
    required: [true, "coupon discount is required"],
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
