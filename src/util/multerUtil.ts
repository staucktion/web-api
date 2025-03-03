import multer, { StorageEngine } from "multer";
import path from "path";
import DateUtil from "./dateUtil";
import Config from "src/config/Config";
import { ORIGINAL_PHOTO_DIR } from "src/constants/photoConstants";

class MulterUtil {
	private multerStorage: StorageEngine;
	private upload: multer.Multer;

	constructor() {
		this.multerStorage = multer.diskStorage({
			destination(_req, _file, cb) {
				cb(null, ORIGINAL_PHOTO_DIR);
			},
			filename(_req, file, cb) {
				const fileExtension = path.extname(file.originalname);
				const uniqueSuffix = DateUtil.format(new Date());
				cb(null, uniqueSuffix + fileExtension);
			},
		});

		this.upload = multer({
			storage: this.multerStorage,
			limits: { fileSize: Config.multerFileSize },
			fileFilter: function (req, file, cb) {
				const allowedMimeTypes = ["image/jpeg", "image/png"];
				if (allowedMimeTypes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
				}
			},
		});
	}

	getUploader() {
		return this.upload;
	}
}

export default MulterUtil;
