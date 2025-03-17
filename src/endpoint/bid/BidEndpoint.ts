import express, { Router } from "express";
import BidFacade from "src/facade/bid/BidFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class BidEndpoint {
	private bidFacade: BidFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.bidFacade = new BidFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/bids/:photoId", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.bidFacade.bid(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default BidEndpoint;
