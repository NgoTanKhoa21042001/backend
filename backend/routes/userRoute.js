const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
} = require("../controller/userController");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logout);
router.route("/password/update").post(updatePassword);

module.exports = router;
