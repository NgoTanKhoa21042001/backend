const express = require("express");
const {
  addCategory,
  getCategories,
  getCategoryDetails,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const router = express.Router();

router.route("/categories").post(addCategory).get(getCategories);

router
  .route("/categories/:id")
  .get(getCategoryDetails)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
