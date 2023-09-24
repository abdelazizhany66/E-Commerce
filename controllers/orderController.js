const stripe = require("stripe")(
  "sk_test_51NtawdFbdIr96Z8WGsEOuZfcvup2N6a13QoRLVbtyLwYHQMQHF35jysEL98yRINwrgsV318igjxjxoRJAhJcogku008D8N2BoJ"
);

const asyncHandler = require("express-async-handler");

const APIError = require("../utils/apiError");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const handlerFactory = require("./handlerFactory");

// @desc   create order
// @route  Post api/v1/orders
// @access protected
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  //1) get cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new APIError("this user is not have cart", 404));
  }
  //2) get total price and if coupon get total after discount
  const taxPrice = 0;
  const shippingPrice = 0;
  let totalPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  totalPrice = totalPrice + taxPrice + shippingPrice;
  //3) create order
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: totalPrice,
    shippingAddress: req.body.shippingAddress,
  });
  //4) edit quantity and sold
  if (order) {
    const bulkOptions = cart.cartItems.map((cartItem) => ({
      updateOne: {
        filter: { _id: cartItem.product },
        update: {
          $inc: { quantity: -cartItem.quantity, sold: +cartItem.quantity },
        },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    //5) delete cartItems
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
//@desc  get all order
//route  get api/v1/orders
//access  user[your orders] && admin-manger[all ordsers in website]
exports.getAllOrders = handlerFactory.getAll(Order);

//@desc  get specific order
//route  get api/v1/orders/:orderId
//access  user[your orders] && admin-manger[all ordsers in website]
exports.getspecificOrder = handlerFactory.getOne(Order);

//@desc  update status order To paid
//route  get api/v1/orders/:id/pay
//access  protect admin-manger
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new APIError(`no order for this id${req.params.id}`, 404));
  }
  //update isPaid from false to true
  order.isPaid = true;
  order.paidAt = Date.now();
  const orderPaid = await order.save();
  res.status(200).json({
    status: "success",
    data: orderPaid,
  });
});

//@desc  update status order To deliver
//route  get api/v1/orders/:id/delivered
//access  protect admin-manger
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new APIError(`no order for this id${req.params.id}`, 404));
  }
  //update isDelivered from false to true
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const orderDelivered = await order.save();
  res.status(200).json({
    status: "success",
    data: orderDelivered,
  });
});

//@desc  create checkout sessions
//route  get api/v1/orders/checkout-session/:cartId
//access  protect user
exports.checkOutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  //get cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new APIError(`this user is not have cart`, 404));
  }
  const price = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalPrice = price + taxPrice + shippingPrice;
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // name: req.user.name,
        // currency: "egp",
        // amount: totalPrice * 100,
        // quantity: 1,
        price_data: {
          currency: "egp",
          unit_amount: totalPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  res.status(200).json({
    status: "success",
    data: session,
  });
});
// exports.checkOutSession = asyncHandler(async (req, res, next) => {
//   // app settings
//   const taxPrice = 0;
//   const shippingPrice = 0;

//   // 1) Get cart depend on cartId
//   const cart = await Cart.findById(req.params.cartId);
//   if (!cart) {
//     return next(
//       new APIError(`There is no such cart with id ${req.params.cartId}`, 404)
//     );
//   }

//   // 2) Get order price depend on cart price "Check if coupon apply"
//   const cartPrice = cart.totalPriceAfterDiscount
//     ? cart.totalPriceAfterDiscount
//     : cart.totalCartPrice;

//   const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

//   // 3) Create stripe checkout session
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         name: req.user.name,
//         amount: totalOrderPrice * 100,
//         currency: "egp",
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: `${req.protocol}://${req.get("host")}/orders`,
//     cancel_url: `${req.protocol}://${req.get("host")}/cart`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.cartId,
//     metadata: req.body.shippingAddress,
//   });

//   // 4) send session to response
//   res.status(200).json({ status: "success", session });
// });

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  const order = await Order.create({
    user: user.id,
    cartItems: cart.cartItems,
    totalOrderPrice: orderPrice,
    shippingAddress,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });
  if (order) {
    const bulkOptions = cart.cartItems.map((cartItem) => ({
      updateOne: {
        filter: { _id: cartItem.product },
        update: {
          $inc: { quantity: -cartItem.quantity, sold: +cartItem.quantity },
        },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});
    //5) delete cartItems
    await Cart.findByIdAndDelete(cartId);
  }
};

exports.webhochCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    // console.log(event.client_reference_id);
    createCardOrder(event.data.object);
    res.status(200).json({ received: true });
  }
});
