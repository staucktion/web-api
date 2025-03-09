import express, { Router } from "express";
import BankFacade from "src/facade/bank/BankFacade";

class BankEndpoint {
	private bankFacade: BankFacade;
	private router: Router;

	constructor() {
		this.bankFacade = new BankFacade();
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/banks/approve-user", async (req, res) => {
			await this.bankFacade.approveUser(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default BankEndpoint;
