const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
// register user
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, name, password } = req.body;
  let user = await User.findOne({ email }).exec();
  if (user)
    return next(
      new ErrorHandler(
        "This email is already used. You can login or use another email to register",
        409
      )
    );
  user = await User.create({ email, name, password });
  res.status(201).json({ success: true, user });
});

// login user

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new ErrorHandler(
        "This Email or Password incorrect. Please enter correct ",
        400
      )
    );
  let user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 404));
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 404));
  } else {
    // const accessToken = getAccessToken(user);
  }
});
