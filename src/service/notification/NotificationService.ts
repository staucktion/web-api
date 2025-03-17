import NotificationDto from "src/dto/notification/NotificationDto";
import WebSocketManager from "src/websocket/WebSocketManager";

class NotificationService {
	private webSocketManager: WebSocketManager;

	constructor(webSocketManager: WebSocketManager) {
		this.webSocketManager = webSocketManager;
	}

	public async sendNotification(notification: NotificationDto): Promise<void> {
		this.webSocketManager.sendToUser(notification.userId, "notification", {
			type: notification.type,
			message: notification.message,
		});
	}
}

export default NotificationService;
