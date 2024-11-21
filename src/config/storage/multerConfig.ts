import multer from "multer";
import path from "path";
import formatDate from "src/util/dateUtil";

const multerStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./storage/upload/");
  },
  filename(req, file, cb) {
    // get file extension
    const fileExtension = path.extname(file.originalname);
    const uniqueSuffix = formatDate(new Date());

    // save the file with a unique name
    cb(null, uniqueSuffix + fileExtension);
  },
});

const uploadPhotoMulter = multer({
  storage: multerStorage,

  // Max file size: 2MB
  limits: { fileSize: 2000000 },
});

export default uploadPhotoMulter;
