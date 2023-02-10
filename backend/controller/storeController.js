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

// get store details
exports.getStoreDetails = asyncHandler(async (req, res, next) => {
  const { roles } = req.userInfo;
  let store;
  if (roles == "seller") {
    const storeId = req.userInfo.storeId;
    store = await Store.findOne({ id: req.params.id, store: storeId });
  } else {
    store = await Store.findById(req.params.id);
  }
  res.status(200).json({ success: true, store });
});

// update stores
exports.updateStore = asyncHandler(async (req, res, next) => {
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
  const updatedBy = req.userInfo.userId;
  const location = { address, city, zipCode, state, country };
  const data = { title, description, location, email, phone, updatedBy };

  const { roles } = req.userInfo;
  let store;
  if (roles == "seller") {
    // store sẽ đợi cho nó tìm ra id và user
    store = await Store.findOne({
      _id: req.params.id,
      store: req.userInfo.storeId,
    });
  } else {
    store = await Store.findById(req.params.id);
  }
  if (!store) {
    return next(new ErrorHandler("Store not found", 409));
  }
  store = await Store.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidator: true,
    useFindAndModify: false,
  });
  if (store) {
    if (req.files) {
      const path = `logo/${store._id}`;
      const remove = removeFiles(path);
      if (remove) {
        const storeLogo = await saveImages(req.files, path);
        store.logo = { url: storeLogo[0] };
        await store.save();
      } else {
        return next(new ErrorHandler("Not proccedd", 409));
      }
    }
  }
  res.status(201).json({ success: true, store });
});

// delete store

exports.deleteStore = asyncHandler(async (req, res, next) => {
  let store = await Store.findById(req.params.id);
  if (!store) {
    return next(new ErrorHandler("Store not found", 404));
  }
  const active = await Product.findOne({ store: req.params.id });
  if (active) {
    return next(
      new ErrorHandler("This store is used in product. Could not deleted", 404)
    );
  }
  const path = `avatar/${store._id}`;
  removeFiles(path);
  await store.remove();
  res.status(200).json({
    success: true,
    message: "Store deleted",
  });
});
