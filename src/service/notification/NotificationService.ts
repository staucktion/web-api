import { PrismaClient } from "@prisma/client";
import NotificationDto from "src/dto/notification/NotificationDto";
import DateUtil from "src/util/dateUtil";
import WebSocketManager from "src/websocket/WebSocketManager";

class NotificationService {
	private webSocketManager: WebSocketManager;
	private prisma: PrismaClient;

	constructor(webSocketManager: WebSocketManager) {
		this.webSocketManager = webSocketManager;
		this.prisma = new PrismaClient();
	}

	public async sendNotification(sentByUserId: number, notification: NotificationDto): Promise<void> {
		this.webSocketManager.sendToUser(notification.userId, "notification", {
			type: notification.type,
			message: notification.message,
		});

		await this.prisma.notification.create({
			data: {
				sent_by_user_id: sentByUserId,
				sent_to_user_id: notification.userId,
				type: notification.type,
				message: notification.message,
				created_at: DateUtil.getNowWithoutMs(),
				updated_at: DateUtil.getNowWithoutMs(),
			},
		});
	}

	public async getNotifications(userId: number): Promise<NotificationDto[]> {
		const notifications = await this.prisma.notification.findMany({
			where: { sent_to_user_id: userId },
			orderBy: { created_at: "desc" },
		});

		return notifications.map((notification) => ({
			userId: Number(notification.sent_to_user_id),
			type: notification.type as "success" | "warning" | "info",
			message: notification.message,
		}));
	}
}

export default NotificationService;
