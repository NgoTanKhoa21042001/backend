const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const Store = require("../models/storeModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
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
    // logic về lưu avatar
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
  // tìm ra email và trùng khớp password
  let user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 404));
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 404));
  } else {
    // login thành công sẽ có accessToken
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
  // so sánh vs pass cũ
  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Old password is incorrect", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true });
});

// update profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = { name: req.body.name };
  let user = await User.findById(req.userInfo.userId);
  if (!user) return next(new ErrorHandler("User not found", 404));
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

// update role
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { roles, store, blocked } = req.body;
  const { userId } = req.userInfo;
  if (roles === "seller" || roles.includes("seller")) {
    if (!store) return next(new ErrorHandler("Please specify a store", 400));
    if (!(await Store.findById(store)))
      return next(new ErrorHandler("Store not found", 404));
    await User.findByIdAndUpdate(
      req.params.id,
      { roles, store, updatedBy: userId, blocked },
      {
        new: true,
        runValidators: true,
        useFindAndMdify: false,
      }
    );
  } else {
    await User.findByIdAndUpdate(
      req.params.id,
      {
        roles,
        updatedBy: userId,
        blocked,
        $unset: { store: "" },
      },
      {
        new: true,
        runValidators: true,
        useFindAndMdify: false,
      }
    );
  }
  res.status(200).json({ success: true });
});

// delete user
// khi mà user đã order đang chờ hàng thì ko đc xóa user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  const activeOrder = await Order.findOne({ user: id });
  if (activeOrder) {
    return next(new ErrorHandler("User not delete", 404));
  }
  const activeProduct = await Product.findOne({
    $or: [{ addedBy: id }, { updatedBy: id }],
  });
  if (activeProduct) {
    return next(new ErrorHandler("User not delete", 404));
  }
  // remove avatar
  const path = `avatar/${user._id}`;
  removeFiles(path);
  await user.remove();
  res.status(200).json({ success: true, message: "User deleted." });
});

// refresh token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  // nếu ko có cookie
  if (!cookies?.jwt) {
    return next(new ErrorHandler("Unauthorized", 401));
  }
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const user = await User.findOne({ refreshToken });

  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        // If there is an error while verifying the JWT (i.e., if the JWT is invalid or the signature is incorrect),
        if (err) {
          return next(new ErrorHandler("Forbidden", 403));
        }
        // Nếu JWT được xác minh thành công, mã sẽ truy xuất ID người dùng từ tải trọng JWT đã giải mã và sử dụng nó để tìm người dùng tương ứng trong db bằng phương thức findOne() từ mô hình Người dùng.
        const hackedUser = await User.findOne({ _id: decoded.userId }).exec();
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    return next(new ErrorHandler("Forbidden", 403));
  }
  //laays refresh token mowis
  const newRefreshTokenArray = user.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        user.refreshToken = [...newRefreshTokenArray];
        await user.save();
        return next(new ErrorHandler("Unauthorized", 401));
      }
      if (err || user._id.toString() !== decoded.userId) {
        return next(new ErrorHandler("Forbidden", 403));
      }

      const accessToken = getAccessToken(user);
      const newRefreshToken = getRefreshToken(user);
      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await user.save();
      res.cookie("jwt", newRefreshToken, cookieOption);
      res
        .status(200)
        .json({ success: true, accessToken, user: sendUser(user) });
    }
  );
});
