const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Addresses added successfully",
    data: user.addresses,
  });
});

exports.removeAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Addresses remove successfully",
    data: user.addresses,
  });
});

exports.getAddressLogedUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    message: "Addresses added successfully",
    result: user.addresses.length,
    data: user.addresses,
  });
});
