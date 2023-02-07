const path = require("path");

exports.saveImages = async (files, getPath) => {
  // save images
  let returnPath = [];
  Object.keys(files).forEach((key) => {
    let fileConvertedName = Date.now().toString();
    let extensionName = path.extname(files[key].name);
    let fileName = fileConvertedName + extensionName;
    // it will create directory folder name with public
    const filePath = path.join(
      __dirname,
      "..",
      `/public/images/${getPath}/`,
      fileName
    );

    returnPath.push(`/images/${getPath}/` + fileName);
    files[key].mv(filePath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: "error", message: err });
      }
    });
  });
  return returnPath;
};
