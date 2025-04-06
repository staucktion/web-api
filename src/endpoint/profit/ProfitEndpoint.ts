import express, { Router } from "express";
import ProfitFacade from "src/facade/profit/ProfitFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class ProfitEndpoint {
	private profitFacade: ProfitFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.profitFacade = new ProfitFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.get("/profits/own", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.profitFacade.getOwnProfits(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default ProfitEndpoint;
