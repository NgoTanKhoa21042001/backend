const ErrorHandler = require("../utils/errHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found.Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  // - Nếu mã lỗi là 11000, đoạn code sẽ tách lấy tên của trường gây ra lỗi từ thông báo lỗi bằng cách sử dụng phương thức split(). Sau đó, đoạn code tạo một thông báo lỗi mới với nội dung là "Duplicate value entered in <tên trường>". Đây là thông báo lỗi tùy chỉnh để hiển thị cho người dùng.
  if (err.code === 11000) {
    const fieldName = err.message.split("index: ")[1].split("_")[0];
    const message = `Duplicate value entered in ${fieldName}`;
    err = new ErrorHandler(message, 409);
  }

  res.status(err.statusCode).json({ success: false, message: err.message });
};
