const express = require("express");
const {
  createProductReview,
  getProductReviews,
  deleteProductReview,
} = require("../controller/reviewController");
const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router
  .route("/reviews")
  .put(isAuthenticated, createProductReview)
  .get(getProductReviews)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProductReview);

module.exports = router;
