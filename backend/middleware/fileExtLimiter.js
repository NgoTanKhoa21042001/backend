const path = require("path");

const fileExtLimiter = (allowedExtArray) => {
  // kiểm tra xem các tập tin được tải lên có hợp lệ hay không.
  return (req, res, next) => {
    if (req.files) {
      const files = req.files;

      //tạo một mảng fileExtensions và duyệt qua từng tập tin trong req.files để lấy ra đuôi tập tin của nó.
      let fileExtensions = [];
      Object.keys(files).forEach((key) => {
        fileExtensions.push(path.extname(files[key].name));
      });

      // Are the file extension allowed?
      //const extensions = [...allowedExtArray];
      // Sau đó, chúng ta sử dụng hàm every để kiểm tra xem tất cả các đuôi tập tin của các tập tin được tải lên có trong allowedExtArray hay không

      const allowed = fileExtensions.every((ext) =>
        allowedExtArray.includes(ext)
      );

      if (!allowed) {
        const message = `Upload failed. Only - ${allowedExtArray.join(
          ", "
        )} files are allowed.`;
        //const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(",", ", ");
        return res.status(422).json({ status: "error", message });
      }
    }
    next();
  };
};

module.exports = fileExtLimiter;
