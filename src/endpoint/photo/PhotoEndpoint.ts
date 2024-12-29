import express, { Router } from "express";
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
		this.router.post(
			"/photo/upload",
			this.multerUtil.getUploader().single("photo"),
			async (req, res) => {
				return await this.photoFacade.uploadPhoto(req, res);
			}
		);

		this.router.get("/photo/list", async (_req, res) => {
			return await this.photoFacade.listPhotos(_req, res);
		});

		this.router.use(
			"/photo/view/static",
			express.static(WATERMARK_PHOTO_DIR)
		);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default PhotoEndpoint;
