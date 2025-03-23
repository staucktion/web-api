import express, { Router } from "express";
import AuctionPhotoFacade from "src/facade/auctionPhoto/AuctionPhotoFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class AuctionPhotoEndpoint {
	private auctionPhotoFacade: AuctionPhotoFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.auctionPhotoFacade = new AuctionPhotoFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.get("/auctions", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.auctionPhotoFacade.getAuctionPhotoList(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default AuctionPhotoEndpoint;
