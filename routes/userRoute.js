const express = require("express");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePasswordUser,
  uploadProfileImage,
  resizeProductImage,
  getLogedUserData,
  updateLoggedUserPassword,
  updateloggedUserData,
  deleteLoggedUser,
} = require("../controllers/userController");
const {
  getUserValidator,
  createUserValidattor,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
//user
router.get("/getme", getLogedUserData, getUser);
router.put("/changemypassword", updateLoggedUserPassword);
router.put("/updateme", updateLoggedUserValidator, updateloggedUserData);
router.delete("/deleteme", deleteLoggedUser);

//Admin
router.use(authController.allowedTo("admin"));
router.put("/changepassword/:id", changePasswordValidator, changePasswordUser);
router
  .route("/")
  .get(getAllUsers)
  .post(
    uploadProfileImage,
    resizeProductImage,
    createUserValidattor,
    createUser
  );
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
