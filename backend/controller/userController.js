const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const { getRefreshToken, getAccessToken } = require("../utils/getTokens");
const { sendUser } = require("../utils/sendUser");
const jwt = require("jsonwebtoken");
const { saveImages, removeFiles } = require("../utils/processImages");
const cookieOption = { httpOnly: true };
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
  if (user) {
    const path = `avatar/${user._id}`;
    const userAvatar = await saveImages(req.files, path);
    user.avatar = { url: userAvatar[0] };
    await user.save();
    res.status(201).json({ success: true, user });
  }
});

// login user

exports.loginUser = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter email & password", 400));
  let user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 404));
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 404));
  } else {
    const accessToken = getAccessToken(user);
    const newRefreshToken = getRefreshToken(user);

    let newRefreshTokenArray = !cookies?.jwt
      ? user.refreshToken
      : user.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      if (!foundToken) {
        console.log("attempted refresh token reuse at login");
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();
    res.cookie("jwt", newRefreshToken, cookieOption);
    res.status(200).json({ success: true, accessToken, user: sendUser(user) });
  }
});

// logout

exports.logout = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res.status(200).json({ success: true, message: "Logged out" });
  const refreshToken = cookies.jwt;
  // tìm cái refreshToken
  const user = await User.findOne({ refreshToken }).exec();
  if (!user) {
    // logout thì cleaer cookie
    res.clearCookie("jwt", { httpOnly: true });
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
  user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
  await user.save();
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

// update password

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter old & new password", 400));

  const user = await User.findById(req.userInfo.userId).select("+password");
  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Old password is incorrect", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true });
});

// update profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = { name: req.body.name, email: req.body.email };
  let user = await User.findById(req.userInfo.userId);
  if (!user) return next(new ErrorHandler("Old password is incorrect", 404));
  user = await User.findByIdAndUpdate(req.userInfo.userId, newUserData, {
    new: true,
    runValidators: true,
    useFindAndMdify: false,
  });
  // avatar user
  if (user) {
    if (req.files) {
      const path = `avatar/${user._id}`;
      const remove = removeFiles(path);
      if (remove) {
        const userImage = await saveImages(req.files, path);
        user.avatar = { url: userImage[0] };
        await user.save();
      } else {
        return next(new ErrorHandler("Not procceded.Try again later.", 500));
      }
    }
  }
  res.status(200).json({
    success: true,
    user: sendUser(user),
  });
});

// get users
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { userId } = req.userInfo;
  // loại bỏ phần ghi token
  const users = await User.find({ _id: { $ne: userId } }).select(
    "-refreshToken"
  );
  res.status(200).json({
    success: true,
    users,
  });
});

// get user details
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-refreshToken");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});
