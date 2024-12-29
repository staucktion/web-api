import express, { Router } from "express";
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
		this.router.post(
			"/photo/upload",
			this.multerUtil.getUploader().single("photo"),
			async (req, res) => {
				return await this.photoFacade.uploadPhoto(req, res);
			}
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default PhotoEndpoint;
