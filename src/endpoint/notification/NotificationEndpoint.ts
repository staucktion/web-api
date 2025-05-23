import express, { Router } from "express";
import NotificationFacade from "src/facade/notification/NotificationFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";
import NotificationService from "src/service/notification/NotificationService";
import WebSocketManager from "src/websocket/WebSocketManager";

class NotificationEndpoint {
	private notificationFacade: NotificationFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor(webSocketManager: WebSocketManager) {
		const notificationService = new NotificationService(webSocketManager);
		this.notificationFacade = new NotificationFacade(notificationService);
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Send notification (authenticated) - admin only
		this.router.post("/notifications/send", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, async (req, res) => {
			await this.notificationFacade.sendNotification(req, res);
		});

		// Mark notification as seen (authenticated)
		this.router.post("/notifications/seen", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.notificationFacade.markNotificationAsSeen(req, res);
		});

		// Get notifications (authenticated)
		this.router.get("/notifications", this.authMiddleware.authenticateJWT, async (req, res) => {
			await this.notificationFacade.getNotifications(req, res);
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default NotificationEndpoint;
