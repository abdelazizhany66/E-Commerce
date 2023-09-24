const multer = require("multer");
const APIError = require("../utils/apiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, files, cb) => {
    // console.log(file);
    if (files.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new APIError("Only image Allow"), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (filedname) => multerOptions().single(filedname);

exports.uploadMixOfImage = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

// multer using DiskStorage

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     // category-${uuid}-${ext}
//     const filename = `category-${uuidv4()}-${Date.now()}-${ext}`;
//     cb(null, filename);
//   },
// });
// memory Storage
// const multerStorage = multer.memoryStorage();

// const multerFilter = function (req, file, cb) {
//   // console.log(file);
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new APIError("Only image Allow"));
//   }
// };
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
