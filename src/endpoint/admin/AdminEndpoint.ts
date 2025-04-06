import express, { Router } from "express";
import AdminFacade from "src/facade/admin/AdminFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class AdminEndpoint {
	private adminFacade: AdminFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.adminFacade = new AdminFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// set configuration (authenticated) - admin only
		this.router.post("/admin/config", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, async (req, res) => {
			await this.adminFacade.setConfig(req, res);
		});

		// get configuration (authenticated) - admin only
		this.router.get("/admin/config", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, async (req, res) => {
			await this.adminFacade.getConfig(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default AdminEndpoint;
