import cors from "cors";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
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
		// allow cors CORS (Cross-Origin Resource Sharing)
		this.app.use(
			cors({
				origin: Config.appUrl,
				credentials: true,
			})
		);

		// log incoming requests
		if (Config.requestLog) this.app.use(Logger.logRequest);

		// parse JSON request body
		this.app.use(express.json());

		// parse cookies
		this.app.use(cookieParser());
	}

	private initializeRoutes(): void {
		// setup routes
		this.router.setupRoute(this.app);
	}

	private checkEnvVariables(): void {
		if (!Config.isEnvVarLoaded) {
			console.error("🐛🐛🐛");
			console.error("🐛 Environment variables are not loaded. Check '.env.dev' and '.env.prod' files.");
			console.error("🐛🐛🐛");
			process.exit(1);
		}
	}

	public listen(): void {
		this.checkEnvVariables();
		const port = Config.port;
		this.app.listen(port, () => {
			console.log("🚀🚀🚀");
			console.log(`🚀 API launched on: http://localhost:${port}`);
			console.log(`🚀 Mode: ${Config.mode}`);
			console.log(`🚀 Request Log: ${Config.requestLog}`);
			console.log(`🚀 Explicit Error Log: ${Config.explicitErrorLog}`);
			console.log("🚀🚀🚀");
		});
	}
}

export default App;
