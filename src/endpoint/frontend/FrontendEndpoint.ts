import express, { Router } from "express";

/** TEMPORARY: Will be changed once React is implemented */
class FrontendEndpoint {
	private router: Router;

	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.use("/", express.static("frontend"));
		this.router.get("/apk", (_req, res) => {
			res.download("frontend/staucktion.apk");
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default FrontendEndpoint;
