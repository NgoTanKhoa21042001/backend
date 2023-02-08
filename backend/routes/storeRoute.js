const express = require("express");

const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { addStore, getStores } = require("../controller/storeController");
const router = express.Router();
router
  .route("/stores")
  .post(
    isAuthenticated,
    authorizeRoles("admin"),
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    addStore
  )
  .get(isAuthenticated, authorizeRoles("admin", "seller"), getStores);
module.exports = router;
