const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
} = require("../controller/userController");
const router = express.Router();

const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");

router
  .route("/register")
  .post(
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    registerUser
  );
router.route("/login").post(loginUser);
router.route("/logout").post(logout);
router.route("/password/update").post(updatePassword);

module.exports = router;
