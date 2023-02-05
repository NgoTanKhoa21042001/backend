const express = require("express");
const {
  addCategory,
  getCategories,
  getCategoryDetails,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router
  .route("/categories")
  .post(isAuthenticated, authorizeRoles("admin"), addCategory)
  .get(getCategories);

router
  .route("/categories/:id")
  .get(getCategoryDetails)
  .put(isAuthenticated, authorizeRoles("admin"), updateCategory)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteCategory);

module.exports = router;
