const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  updateProfile,
} = require("../controller/userController");
const router = express.Router();

const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated } = require("../middleware/auth");

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
router.route("/logout").post(isAuthenticated, logout);
router.route("/password/update").put(isAuthenticated, updatePassword);

router
  .route("/me/update")
  .put(
    isAuthenticated,
    fileUpload({ createParentPath: true }),
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    updateProfile
  );

module.exports = router;
