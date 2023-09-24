const express = require("express");
const {
  signUp,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../controllers/authController");
const {
  signUpValidator,
  loginValidator,
} = require("../utils/validator/authValidator");

const router = express.Router();

router.post("/signup", signUpValidator, signUp);
router.post("/login", loginValidator, login);
router.post("/forgotpassword", forgotPassword);
router.post("/verifypassword", verifyPassResetCode);
router.put("/resetpassword", resetPassword);

module.exports = router;
