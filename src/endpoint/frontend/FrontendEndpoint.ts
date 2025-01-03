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
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		// Correct the path to the frontend build folder
		const frontendBuildPath = path.resolve(
			__dirname,
			"../../../frontend/build"
		);

		// Serve the React build folder
		this.router.use(express.static(frontendBuildPath));

		// Handle React client-side routing
		this.router.get("*", (_req, res) => {
			res.sendFile(path.join(frontendBuildPath, "index.html"));
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default FrontendEndpoint;
