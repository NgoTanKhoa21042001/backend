const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const { saveImages, removeFiles } = require("../utils/processImages");

// create review
exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.userInfo.userId,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.userInfo.userId.toString()
  );

  if (isReviewed) {
    // kiểm tra xem product có đc reviews chưa, nếu có thì lặp qua mỗi sản phẩm có đc đánh giá bởi người dùng hay chưa
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.userInfo.userId.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// get review

exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate({
    path: "reviews",
    populate: { path: "user", select: "name avatar" },
  });
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ success: true, reviews: product.reviews });
});

// delete review
exports.deleteProductReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Cannot delete without product", 404));
  }
  // lọc một mảng các bình luận liên quan đến sản phẩm này, nó sẽ loại bỏ bình luận có id khớp với id truyền vào từ req.query.id.
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  //tính trung bình các đánh giá của một sản phẩm,
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  let ratings = 0;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }
  const numOfReviews = reviews.length;
  // Đoạn code này đang cập nhật một sản phẩm bằng cách thay đổi các trường dữ liệu reviews, ratings, numOfReviews. Nó sử dụng new: true để lấy phiên bản mới của sản phẩm sau khi cập nhật, useFindAndModify: false để hủy quá trình lấy dữ liệu cũ và runValidators: true để kiểm tra dữ liệu trước khi cập nhật.
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({ success: true });
});
