const express = require("express");
const {
  addProduct,
  getProducts,
  getProductsDetails,
  getProductsByAuthorizeRoles,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
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

router
  .route("/products/:id")
  .get(getProductsDetails)
  .put(
    isAuthenticated,
    authorizeRoles("admin", "seller"),
    fileUpload({ createParentPath: true }),
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    updateProduct
  )
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

router
  .route("/authorized/products")
  .get(
    isAuthenticated,
    authorizeRoles("admin", "seller"),
    getProductsByAuthorizeRoles
  );

module.exports = router;
