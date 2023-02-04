const express = require("express");
const {
  addBrand,
  getBrands,
  getBrandDetails,
  updateBrand,
  deleteBrand,
} = require("../controller/brandController");
const router = express.Router();

router.route("/brands").post(addBrand).get(getBrands);

router
  .route("/brands/:id")
  .get(getBrandDetails)
  .put(updateBrand)
  .delete(deleteBrand);

module.exports = router;
