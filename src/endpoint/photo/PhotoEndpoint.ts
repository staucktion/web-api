import express, { Router } from "express";
import path from "path";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import PhotoFacade from "src/facade/photo/photoFacade";
import MulterUtil from "src/util/multerUtil";

class PhotoEndpoint {
	private photoFacade: PhotoFacade;
	private router: Router;
	private multerUtil: MulterUtil;

	constructor() {
		this.photoFacade = new PhotoFacade();
		this.router = express.Router();
		this.multerUtil = new MulterUtil();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/photos", this.multerUtil.getUploader().single("photo"), async (req, res) => {
			await this.photoFacade.uploadPhoto(req, res);
		});

		this.router.get("/photos", async (_req, res) => {
			await this.photoFacade.listPhotos(_req, res);
		});

		this.router.get("/photos/:photoId", async (req, res) => {
			await this.photoFacade.getPhoto(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default PhotoEndpoint;
