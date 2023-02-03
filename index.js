const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGO_DB, () => {
  console.log("Connected to MongoDB");
});

// AUTHENTICATION : SO sánh pass của user so với info trên db, so sánh dữ liệu nhập vs db đã có
// AUTHORIZATION: bạn là ai và bạn có quyền làm gi (phần quyền)
