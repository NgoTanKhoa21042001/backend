const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  updateProfile,
  getUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
} = require("../controller/userController");
const router = express.Router();

const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

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
router.route("/users").get(isAuthenticated, authorizeRoles("admin"), getUsers);

router
  .route("/users/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticated, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

module.exports = router;
