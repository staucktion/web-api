import express, { Router } from "express";
import CronFacade from "src/facade/cron/CronFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class CronEndpoint {
	private cronFacade: CronFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.cronFacade = new CronFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// get crons (authenticated)
		this.router.get("/crons", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.cronFacade.getCrons(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default CronEndpoint;
