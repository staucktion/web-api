import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

class FrontendEndpoint {
	private router: Router;

	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Resolve the __dirname equivalent for ES modules
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		// Resolve the absolute path to the "frontend" directory
		const frontendPath = path.resolve(__dirname, "../../../frontend");
		this.router.use("/", express.static(frontendPath));
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default FrontendEndpoint;
