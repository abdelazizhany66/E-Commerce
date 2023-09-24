const asyncHandler = require("express-async-handler");

const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const APIError = require("../utils/apiError");

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { color, productId } = req.body;
  //get price from db
  const product = await Product.findById(productId);
  //get cart of logged user
  let cart = await Cart.findOne({ user: req.user._id });

  //if no cart create one
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // if i have a cart check if this product exist
    const productExist = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === req.body.productId &&
        item.color === req.body.color
    );
    //if itemexist > -1 this meaning find product
    if (productExist > -1) {
      //qiantity +=1
      const object = cart.cartItems[productExist];
      object.quantity += 1;

      cart.cartItems[productExist] = object;
    } else {
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }
  //calculate total price
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "product added successfully",
    data: cart,
  });
});

// @desc    get all product from cart
// @route   get /api/v1/cart
// @access  Private/User
exports.getAllProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new APIError("No Product in Cart, please Added products and try again")
    );
  }
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    remove product to cart
// @route   put or delete /api/v1/cart/:itemId
// @access  Private/User
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Delete All product from cart
// @route   put or delete /api/v1/cart
// @access  Private/User
exports.deleteCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).send();
});

// @desc    Update quantity product in cart
// @route   put or delete /api/v1/cart
// @access  Private/User
exports.updateQuantityProduct = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new APIError("no Cart From this user ", 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const product = cart.cartItems[itemIndex];
    product.quantity = req.body.quantity;
    cart.cartItems[itemIndex] = product;
  } else {
    return next(
      new APIError(`there is no item for this id :${req.params.itemId}`, 404)
    );
  }
  //calculate total price
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Apply coupon to all cart items
// @route   put /api/v1/cart/applyCoupon
// @access  Private/User

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //get coupon basic name (unique) and expire
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gte: Date.now() },
  });
  if (!coupon) {
    return next(new APIError("no coupon in this name or expire", 404));
  }
  const cart = await Cart.findOne({ user: req.user._id });
  const { totalPrice } = cart;
  const totalpriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalpriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
