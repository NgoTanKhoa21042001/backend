const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errHandler");
const asyncHandler = require("express-async-handler");
const { saveImages, removeFiles } = require("../utils/processImages");

exports.addStore = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    address,
    city,
    zipCode,
    state,
    country,
    email,
    phone,
  } = req.body;
  console.log(req.userInfo);
  const addedBy = req.userInfo.userId;
  const location = { address, city, zipCode, state, country };
  const data = { title, description, location, email, phone, addedBy };

  const store = await Store.create(data);
  if (store) {
    const path = `logo/${store._id}`;
    const storeLogo = await saveImages(req.files, path);
    store.logo = { url: storeLogo[0] };
    await store.save();
    res.status(201).json({ success: true, store });
  }
});
// get store
exports.getStores = asyncHandler(async (req, res, next) => {
  let stores;
  const { roles } = req.userInfo;
  if (roles == "seller") {
    const storeId = req.userInfo.storeId;
    stores = await Store.find({ store: storeId });
  } else {
    stores = await Store.find();
  }
  res.status(200).json({ success: true, stores });
});
