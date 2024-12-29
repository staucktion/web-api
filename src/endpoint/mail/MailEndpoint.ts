import express, { Router } from "express";
import MailFacade from "src/facade/mail/mailFacade";

class MailEndpoint {
	private mailFacade: MailFacade;
	private router: Router;

	constructor() {
		this.mailFacade = new MailFacade();
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/mail/send", async (req, res) => {
			return await this.mailFacade.sendMail(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default MailEndpoint;
