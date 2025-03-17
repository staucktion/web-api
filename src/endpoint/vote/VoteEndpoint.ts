import express, { Router } from "express";
import VoteFacade from "src/facade/vote/VoteFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class VoteEndpoint {
	private voteFacade: VoteFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.voteFacade = new VoteFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post("/votes/:photoId", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.voteFacade.vote(req, res);
		});

		this.router.get("/votes/user", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.voteFacade.getUserVotes(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default VoteEndpoint;
