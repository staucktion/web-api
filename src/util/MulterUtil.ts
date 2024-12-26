import multer, { StorageEngine } from "multer";
import path from "path";
import DateUtil from "./DateUtil";

class MulterUtil {
  private multerStorage: StorageEngine;
  private upload: multer.Multer;

  constructor() {
    this.multerStorage = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, "./storage/upload/");
      },
      filename(req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = DateUtil.format(new Date());
        cb(null, uniqueSuffix + fileExtension);
      },
    });

    this.upload = multer({
      storage: this.multerStorage,
      limits: { fileSize: 2000000 }, // Max file size: 2MB
    });
  }

  getUploader() {
    return this.upload;
  }
}

export default MulterUtil;
