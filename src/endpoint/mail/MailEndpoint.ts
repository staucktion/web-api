import express, { Router } from "express";
import MailFacade from "src/facade/mail/mailFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class MailEndpoint {
	private mailFacade: MailFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.mailFacade = new MailFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/mail/send", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.mailFacade.sendMail(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default MailEndpoint;
