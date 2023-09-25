const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const APIError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createJWT = require("../utils/createJWT");
const { sanitizeUser } = require("../utils/sanitizeData");

//@desc   SginUp
//@route  post /api/v1/auth/signup
//@access Public
exports.signUp = asyncHandler(async (req, res) => {
  //1) Create a new User account
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password, // not used bcrypt because used in mongoose middleware
  });
  //2) create jwt
  const token = createJWT(user._id);
  //3)response to client request
  res.status(201).json({
    success: "success",
    token,
    data: sanitizeUser(user),
  });
});

//@desc    login
//@router  Post /api/v1/auth/login
//@access  public
exports.login = asyncHandler(async (req, res, next) => {
  //1) check user and password write in body {validator}
  //2)check email in db and check user password Equal password in body
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new APIError(" Email or Password not exist", 401));
  }
  //# Create a Jwt
  const token = createJWT(user._id);
  res.status(200).json({
    success: "success",
    token,
    data: user,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  //1) check if token exist , if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new APIError("You Are Not login, please login to get this route", 401)
    );
  }
  //2) verfy token if happen any change to data
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check of user in database or not
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new APIError("this user not belong to this token does not exist")
    );
  }
  //check if user active or not
  if (!currentUser.active) {
    return next(
      new APIError("this user not active should be active and return try", 404)
    );
  }
  //4) check if user change password after token create
  let passChangedTimestamp;
  if (currentUser.passwordChangedAt) {
    passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
  }
  if (passChangedTimestamp > decoded.iat) {
    return next(
      new APIError("user recently change password please loin again..", 401)
    );
  }
  // Allow the user to go to next step
  req.user = currentUser;
  next();
});

//@desc who can access to thw next step

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new APIError("you are not allowed to access this route"));
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1) check if the user exists , if exists get user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new APIError(`there is no user with this email ${req.body.email}`, 404)
    );
  }
  //2) create the random 6 digital
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  //3) hash the random digital and in database
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.resetPasswordCode = hashResetCode;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  user.resetPasswordVerified = false;
  await user.save();
  //4) send email to the user
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordVerified = undefined;
    await user.save();
    return next(new APIError("There is an error in sending email", 500));
  }
  res.status(200).json({
    status: "success",
    message: " reset code send to email successfully",
  });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  //1)get user base on reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordCode: hashResetCode,
    resetPasswordExpires: { $gte: Date.now() },
  });
  if (!user) {
    return next(new APIError("Reset code Invalid or expired"));
  }
  // 2) Reset code valid
  user.resetPasswordVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1) get user based email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new APIError(`there is no user in this email ${req.body.email}`, 404)
    );
  }
  //2) check if reset code vailed
  if (!user.resetPasswordVerified) {
    return next(new APIError("reset code not verified", 400));
  }
  //3) change password
  user.password = req.body.newPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  user.resetPasswordVerified = undefined;
  await user.save();

  //4) if everything is ok , generate token
  const token = createJWT(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
