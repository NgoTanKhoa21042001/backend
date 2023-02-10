const express = require("express");
const { addProduct, getProducts } = require("../controller/productController");
const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router
  .route("/products")
  .post(
    isAuthenticated,
    authorizeRoles("admin", "seller"),
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    addProduct
  )
  .get(getProducts);

module.exports = router;
