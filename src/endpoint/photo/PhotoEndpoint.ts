import express, { Router } from "express";
import PhotoFacade from "src/facade/photo/photoFacade";
import MulterUtil from "src/util/multerUtil";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class PhotoEndpoint {
	private photoFacade: PhotoFacade;
	private router: Router;
	private multerUtil: MulterUtil;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.photoFacade = new PhotoFacade();
		this.router = express.Router();
		this.multerUtil = new MulterUtil();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Upload a photo (authenticated)
		this.router.post("/photos", this.authMiddleware.authenticateJWT, this.multerUtil.getUploader().single("photo"), (req, res) => {
			this.photoFacade.uploadPhoto(req, res);
		});

		// Get all approved photos (public)
		this.router.get("/photos", (req, res) => {
			this.photoFacade.listPhotos(req, res);
		});

		// Get waiting photos (authenticated)
		this.router.get("/photos/waiting", this.authMiddleware.authenticateJWT, (req, res) => {
			this.photoFacade.listWaitingPhotos(req, res);
		});

		// Approve/reject a photo (authenticated)
		this.router.put("/photos/:photoId/status", this.authMiddleware.authenticateJWT, (req, res) => {
			this.photoFacade.approveRejectPhoto(req, res);
		});

		// Get a specific photo (public)
		this.router.get("/photos/:photoId", (req, res) => {
			this.photoFacade.getPhoto(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default PhotoEndpoint;
