import express, { Router } from "express";
import BankFacade from "src/facade/bank/BankFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class BankEndpoint {
	private bankFacade: BankFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.bankFacade = new BankFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/banks/approve-user", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.bankFacade.approveUser(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default BankEndpoint;
