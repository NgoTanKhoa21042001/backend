const Brand = require("../models/brandModel");
const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
// add the category
exports.addBrand = asyncHandler(async (req, res, next) => {
  req.body.addedBy = req.userInfo.userId;

  const brand = await Brand.create(req.body);
  res.status(200).json({ success: true, brand });
});

// get the category

exports.getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find();
  res.status(200).json({ success: true, brands });
});

// get the category details

exports.getBrandDetails = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new ErrorHandler("Brand not found", 404));

  res.status(200).json({ success: true, brand });
});

// update the category

exports.updateBrand = asyncHandler(async (req, res, next) => {
  req.body.updatedBy = req.userInfo.userId;
  let brand = await Brand.findById(req.params.id);
  if (!brand) return next(new ErrorHandler("Brand not found.", 404));
  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(201).json({ success: true, brand });
});

// delete the category

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  let brand = await Brand.findById(req.params.id);
  if (!brand) return next(new ErrorHandler("Brand not found.", 404));
  const active = await Product.findOne({ brand: req.params.id });
  if (active)
    return next(new ErrorHandler("Brand is used.Could not deleted.", 406));
  await brand.remove();
  res.status(200).json({ success: true });
});
