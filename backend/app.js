const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorMiddleware = require("./middleware/error");
app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const category = require("./routes/categoryRoute");
const brand = require("./routes/brandRoute");

app.use("/api/v1", category);
app.use("/api/v1", brand);

app.use(errorMiddleware);
// AUTHENTICATION : SO sánh pass của user so với info trên db, so sánh dữ liệu nhập vs db đã có
// AUTHORIZATION: bạn là ai và bạn có quyền làm gi (phần quyền)
module.exports = app;
