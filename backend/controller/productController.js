const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const { saveImages, removeFiles } = require("../utils/processImages");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apiFeature");

// add product
exports.addProduct = asyncHandler(async (req, res, next) => {
  const { roles } = req.userInfo;
  req.body.addedBy = req.userInfo.userId;
  if (roles === "seller" || roles.includes("seller")) {
    req.body.store = req.userInfo.storeId;
  } else {
    req.body.store = req.body.store;
  }
  let product = await Product.create(req.body);
  if (product) {
    const path = `products/${req.body.store}/${product._id}`;
    const productImages = await saveImages(req.files, path);
    product.images = productImages.map((image) => ({ url: image }));
    product = await product.save();
    res.status(201).json({ success: true, product });
  }
});

// get product

exports.getProducts = asyncHandler(async (req, res, next) => {
  let resultPerPage;
  if (req.query.limit) {
    resultPerPage = parseInt(req.query.limit);
  } else {
    resultPerPage = 8;
  }
  let sortBy;
  if (req.query.sort_by_ratings) {
    if (req.query.sort_by_ratings === "true") {
      sortBy = { ratings: -1 };
    }
  } else {
    sortBy = {};
  }

  if (req.query.sort_by_oldest) {
    if (req.query.sort_by_oldest === "true") {
      sortBy = Object.assign(sortBy, { createAt: +1 });
    }
  } else {
    sortBy = Object.assign(sortBy, { createAt: -1 });
  }
  //Trả về số lượng tài liệu khớp với truy vấn cho một bộ sưu tập hoặc dạng xem
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find().sort(sortBy), req.query)
    .search()
    .filter();
  let filteredProductsCount = await apiFeature.query.length;
  apiFeature.pagination(resultPerPage);
  const products = await apiFeature.query;

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage,
    filteredProductsCount,
  });
});
