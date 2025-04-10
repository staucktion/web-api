import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import { createServer, Server as HttpServer } from "http";
import Config from "src/config/Config";
import DbConfigFacade from "src/facade/dbConfig/DbConfigFacade";
import Logger from "src/log/Logger";
import Router from "src/router/Router";
import { Timer } from "src/timer/Timer";
import { cronEnum } from "src/types/cronEnum";
import WebSocketManager from "src/websocket/WebSocketManager";

class App {
	private app: Application;
	private router: Router;
	private httpServer: HttpServer;
	private webSocketManager: WebSocketManager;
	private dbConfigFacade: DbConfigFacade;
	private timerStarter: Timer;
	private timerVote: Timer;
	private timerAuction: Timer;
	private timerPurchaseAfterAuction: Timer;

	constructor() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.webSocketManager = new WebSocketManager(this.httpServer);
		this.router = new Router(this.webSocketManager);
		this.dbConfigFacade = new DbConfigFacade();
	}

	public async init(): Promise<void> {
		console.log("[INFO] initializing application...");
		await this.dbConfigFacade.syncDbConfig();
		this.initializeMiddlewares();
		this.initializeRoutes();
		if (Config.isTimerActive) {
			this.timerStarter = new Timer(this.webSocketManager, cronEnum.STARTER);
			this.timerVote = new Timer(this.webSocketManager, cronEnum.VOTE);
			this.timerAuction = new Timer(this.webSocketManager, cronEnum.AUCTION);
			this.timerPurchaseAfterAuction = new Timer(this.webSocketManager, cronEnum.PURCHASE_AFTER_AUCTION);

			this.timerStarter.start();
			this.timerVote.start();
			this.timerAuction.start();
			this.timerPurchaseAfterAuction.start();
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
