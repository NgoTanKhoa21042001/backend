const Category = require("../models/categoryModel");
const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Stripe = require("stripe");

exports.processPayment = asyncHandler(async (req, res, next) => {
  // stripe.paymentIntents.create được gọi để tạo một Payment Intent mới. Tham số cho hàm này bao gồm số tiền mà người dùng muốn thanh toán (req.body.amount), loại tiền tệ (INR), và tùy chọn cho phép tự động thanh toán.
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    automatic_payment_methods: { enabled: true },
  });
  res.status(200).json({ clientSecret: paymentIntent.client_secret });
});

exports.sendStripePublishableKey = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});
