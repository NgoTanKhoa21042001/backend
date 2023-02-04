const Category = require("../models/categoryModel");
const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");

// add the category
exports.addCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

// get the category

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(201).json({ success: true, categories });
});

// get the category details

exports.getCategoryDetails = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  res.status(201).json({ success: true, category });
});

// update the category

exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) return next(new ErrorHandler("Category not found", 404));

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(201).json({ success: true, category });
});

// delete the category

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) return next(new ErrorHandler("Category not found", 404));

  await category.remove();

  res.status(200).json({ success: true });
});
