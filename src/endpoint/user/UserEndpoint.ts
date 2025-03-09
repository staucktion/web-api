import express, { Router } from "express";
import multer from "multer";
import * as path from "path";
import UserFacade from "src/facade/user/userFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";
import { PROFILE_PICTURE_DIR } from "src/constants/photoConstants";

class UserEndpoint {
	private userFacade: UserFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;
	private upload: multer.Multer;

	constructor() {
		this.userFacade = new UserFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();

		const storage = multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, PROFILE_PICTURE_DIR);
			},
			filename: function (req, file, cb) {
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				const fileExt = path.extname(file.originalname);
				cb(null, `profile-${uniqueSuffix}${fileExt}`);
			},
		});

		this.upload = multer({
			storage,
			limits: {
				fileSize: 5 * 1024 * 1024, // 5MB limit
			},
			fileFilter: function (req, file, cb) {
				const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
				if (allowedMimeTypes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
				}
			},
		});

		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Update current user's profile - authenticated access
		this.router.put("/users/profile", this.authMiddleware.authenticateJWT, this.upload.single("profile_picture"), this.userFacade.handleUpdateUser);

		// Serve profile pictures as static files
		this.router.use("/profile-pictures", express.static(PROFILE_PICTURE_DIR));
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default UserEndpoint;
