const express = require("express");
const {
  createCashOrder,
  getAllOrders,
  filterOrderForLoggedUser,
  getspecificOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkOutSession,
} = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router
  .route("/:cartId")
  .post(authController.allowedTo("user"), createCashOrder);
router.get(
  "/",
  authController.allowedTo("user", "manager", "admin"),
  filterOrderForLoggedUser,
  getAllOrders
);
router.get(
  "/:id",
  authController.allowedTo("user", "manager", "admin"),
  filterOrderForLoggedUser,
  getspecificOrder
);
router.put(
  "/:id/pay",
  authController.allowedTo("manager", "admin"),
  updateOrderToPaid
);
router.put(
  "/:id/delivered",
  authController.allowedTo("manager", "admin"),
  updateOrderToDelivered
);
router.get(
  "/checkout-session/:cartId",
  authController.allowedTo("user"),
  checkOutSession
);
module.exports = router;
