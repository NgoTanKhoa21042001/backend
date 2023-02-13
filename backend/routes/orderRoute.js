const express = require("express");
const fileUpload = require("express-fileupload");
const filesPayloadExists = require("../middleware/filePayloadExists");
const fileExtLimiter = require("../middleware/fileExtLimiter");
const fileSizeLimiter = require("../middleware/fileSizeLimiter");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const {
  newOrder,
  getSignleOrder,
  getAllOrders,
  myOrders,
  deleteOrder,
  updateOrder,
} = require("../controller/orderController");
const router = express.Router();

router
  .route("/orders")
  .post(isAuthenticated, newOrder)
  .get(isAuthenticated, myOrders);

router.route("/orders/:id").get(isAuthenticated, getSignleOrder);
router
  .route("/authorized/orders")
  .get(isAuthenticated, authorizeRoles("admin"), getAllOrders);

router
  .route("/authorized/orders/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteOrder)
  .put(isAuthenticated, authorizeRoles("admin"), updateOrder);
module.exports = router;
