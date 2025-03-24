import cors from "cors";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { createServer, Server as HttpServer } from "http";
import Config from "src/config/Config";
import Logger from "src/log/Logger";
import Router from "src/router/Router";
import WebSocketManager from "src/websocket/WebSocketManager";
import { Timer } from "src/timer/Timer";

class App {
	private app: Application;
	private router: Router;
	private httpServer: HttpServer;
	private webSocketManager: WebSocketManager;
	private timer: Timer;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.webSocketManager = new WebSocketManager(this.httpServer);
		this.router = new Router(this.webSocketManager);
		this.initializeMiddlewares();
		this.initializeRoutes();
		if (Config.isTimerActive) {
			this.timer = new Timer(this.webSocketManager);
			this.timer.start();
		}
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
		this.httpServer.listen(port, () => {
			console.log("🚀🚀🚀");
			console.log(`🚀 API launched on: http://localhost:${port}`);
			console.log(`🚀 Mode: ${Config.mode}`);
			console.log(`🚀 Request Log: ${Config.requestLog}`);
			console.log(`🚀 Explicit Error Log: ${Config.explicitErrorLog}`);
			console.log("🚀 WebSocket server is ready for connections");
			console.log("🚀🚀🚀");
		});
	}

	// Method to access WebSocket manager for broadcasting messages
	public getWebSocketManager(): WebSocketManager {
		return this.webSocketManager;
	}
}

export default App;

process.on("unhandledRejection", (reason, p) => {
	console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	console.log("Uncaught Exception:", error);
});
