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
		// change comission configuration (authenticated) - admin only
		this.router.post("/admin/config/comission", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, async (req, res) => {
			await this.adminFacade.changeComissionConfig(req, res);
		});

		// get comission configuration (authenticated) - admin only
		this.router.get("/admin/config/comission", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, async (req, res) => {
			await this.adminFacade.getComissionConfig(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default AdminEndpoint;
