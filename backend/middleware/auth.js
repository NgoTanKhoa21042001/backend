const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errHandler");
const jwt = require("jsonwebtoken");
// xác thực người dùng, tt login
exports.isAuthenticated = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer"))
    return next(new ErrorHandler("Unauthorized", 401));
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new ErrorHandler("Forbidden", 403));
    req.userInfo = decoded.UserInfo;
    next();
  });
});
// cấp quyền role cho phép truy cập gi đó

/**
 * 
 * Trong đoạn code trên, chúng ta có một hàm exports.authorizeRoles với tham số là một danh sách các vai trò cho phép (allowedRoles). Hàm này trả về một hàm middleware cho ExpressJS, mà sẽ kiểm tra xem người dùng có quyền truy cập hay không.

Trong hàm middleware, chúng ta kiểm tra xem req.userInfo.roles có tồn tại hay không. Nếu không tồn tại, hàm sẽ trả về một lỗi với trạng thái 401 (Unauthorized). 

Sau đó, chúng ta tạo một mảng rolesArray từ allowedRoles và sử dụng hàm map để so sánh các vai trò của người dùng trong req.userInfo.roles với rolesArray. Nếu tìm thấy một vai trò trong req.userInfo.roles có trong rolesArray, hàm sẽ trả về giá trị true và kết thúc. Nếu không tìm thấy, hàm sẽ trả về lỗi 401 (Unauthorized).
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.userInfo?.roles)
      return next(new ErrorHandler("Unauthorized", 401));
    const rolesArray = [...allowedRoles];
    const result = req.userInfo.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);
    if (!result) return next(new ErrorHandler("Unauthorized", 401));
    next();
  };
};
