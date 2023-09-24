const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const { uploadSingleImage } = require("../middleware/upoaldImageMiddleware");
const APIError = require("../utils/apiError");
const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const createJWT = require("../utils/createJWT");

exports.uploadProfileImage = uploadSingleImage("profileImg");

exports.resizeProductImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    req.body.profileImg = `user-${uuidv4()}-${Date.now()}-jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 92 })
      .toFile(`uploads/users/${req.body.profileImg}`);
  }
  next();
});

//@desc   Get list of users
//@route  Get /api/v1/users
//@access Private
exports.getAllUsers = handlerFactory.getAll(User);

//desc     Create a new User
//@route   Post /api/v1/users
//@accsess Private
exports.createUser = handlerFactory.createOne(User);

//desc     Get Specific User
//@route   Get /api/v1/users/:id
//@accsess Private
exports.getUser = handlerFactory.getOne(User);

//desc     update Specific User
//@route   Put /api/v1/users/:id
//@accsess Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      slug: req.body.slug,
      profileImg: req.body.profileImg,
      phone: req.body.phone,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new APIError(`No document For this Id ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: "success",
    data: document,
  });
});

//desc     update password User
//@route   Put /api/v1/changepassword/:id
//@accsess Private
exports.changePasswordUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!user) {
    return next(new APIError(`No user For this Id ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

//desc     delete Specific User
//@route   delete /api/v1/users/:id
//@accsess Private
exports.deleteUser = handlerFactory.deleteOne(User);

exports.getLogedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  const token = createJWT(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

exports.updateloggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(200).json({
    status: "success",
  });
});
