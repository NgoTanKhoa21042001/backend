const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const { saveImages, removeFiles } = require("../utils/processImages");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

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

  const filteredApiFeature = new ApiFeatures(
    Product.find().sort(sortBy),
    req.query
  )
    .search()
    .filter();

  let filterdProduct = await filteredApiFeature.query;

  let filteredProductsCount = filterdProduct.length;

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
// product details
exports.getProductsDetails = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    // lấy ra doc trong mongoose
    // truy vấn tới đối tượng
    .populate("store", "id title")
    .populate("brand", "id title")
    .populate("category", "id title")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "name avatar" },
    });

  if (!product) return next(new ErrorHandler("Product not found", 404));
  res.status(200).json({
    success: true,
    product,
  });
});
// get product by authorized
exports.getProductsByAuthorizeRoles = asyncHandler(async (req, res, next) => {
  const { roles } = req.userInfo;
  let storeId;
  let products;
  if (roles === "seller" || roles.includes("seller")) {
    storeId = req.userInfo.storeId;
    products = await Product.find({ store: storeId });
  } else {
    products = await Product.find();
  }

  res.status(200).json({ success: true, products });
});

// update productss
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { roles } = req.userInfo;
  req.body.updatedBy = req.userInfo.userId;

  let product;
  if (roles === "seller" || roles.includes("seller")) {
    product = await Product.findOne({
      _id: req.params.id,
      store: req.userInfo.storeId,
    });
    req.body.store = req.userInfo.storeId;
  } else {
    product = await Product.findById(req.params.id);
  }

  if (!product) return next(new ErrorHandler("Product not found", 404));
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (product) {
    if (req.files) {
      // Để lưu trữ các hình ảnh sản phẩm mới
      const path = `products/${product.store}/${product._id}`;
      const remove = removeFiles(path);
      if (remove) {
        //  nó sử dụng phương thức saveImages() để lưu trữ các hình ảnh mới tải lên. Hàm saveImages() sẽ trả về một mảng các đường dẫn đến các hình ảnh mới.
        const productImages = await saveImages(req.files, path);
        product.images = productImages.map((image) => ({ url: image }));
        await product.save();
      } else {
        return next(new ErrorHandler("Not proccedded.", 500));
      }
    }
  }

  res.status(201).json({ success: true, product });
});

// delete product

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Store not found", 409));
  }
  // à sử dụng toán tử $elemMatch để chỉ định rằng chúng ta muốn tìm một mặt hàng có thuộc tính product bằng req.params.id.
  const active = await Order.findOne({
    orderItems: { $elemMatch: { product: req.params.id } },
  });
  // nếu đã có order rồi thì ko dc xóa product
  if (active) {
    return next(
      new ErrorHandler("Product is used in ordered. Could not deleted", 404)
    );
  }
  // gỡ ảnh
  const path = `products/${product.store}/${product._id}`;
  const remove = removeFiles(path);

  if (remove) {
    await product.remove();
    res.status(200).json({ success: true, message: "Product deleted" });
  }
  new ErrorHandler("Not procceded", 404);
});
