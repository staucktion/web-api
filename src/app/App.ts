import express, { Application } from "express";
import cors from "cors"; // <-- 1) Import cors
import Config from "src/config/Config";
import Logger from "src/log/Logger";
import Router from "src/router/Router";

class App {
	private app: Application;
	private router: Router;

	constructor() {
		this.app = express();
		this.router = new Router();
		this.initializeMiddlewares();
		this.initializeRoutes();
	}

	private initializeMiddlewares(): void {
		// log incoming request
		if (Config.requestLog) this.app.use(Logger.logRequest);

		// 2) Enable CORS *before* routes
		this.app.use(
			cors({
				origin: "http://localhost:3000", // your React dev server
				credentials: true, // if you need cookies/auth
			})
		);

		// 3) Parse JSON request body
		this.app.use(express.json());
	}

	private initializeRoutes(): void {
		// setup routes
		this.router.setupRoute(this.app);
	}

	public listen(): void {
		const port = Config.port;
		this.app.listen(port, () => {
			console.log("🚀🚀🚀");
			console.log(`🚀 API launched on: http://localhost:${port}`);
			console.log(`🚀 Mode: ${Config.mode}`);
			console.log(`🚀 Request Log: ${Config.requestLog}`);
			console.log("🚀🚀🚀");
		});
	}
}

export default App;
