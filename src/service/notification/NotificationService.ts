import { PrismaClient } from "@prisma/client";
import SendNotificationDto from "src/dto/notification/SendNotificationDto";
import DateUtil from "src/util/dateUtil";
import WebSocketManager from "src/websocket/WebSocketManager";

class NotificationService {
	private webSocketManager: WebSocketManager;
	private prisma: PrismaClient;

	constructor(webSocketManager: WebSocketManager) {
		this.webSocketManager = webSocketManager;
		this.prisma = new PrismaClient();
	}

	public async sendNotification(sentByUserId: number, notification: SendNotificationDto): Promise<void> {
		const createdNotification = await this.prisma.notification.create({
			data: {
				sent_by_user_id: sentByUserId,
				sent_to_user_id: notification.userId,
				type: notification.type,
				message: notification.message,
				created_at: DateUtil.getNowWithoutMs(),
				updated_at: DateUtil.getNowWithoutMs(),
			},
		});

		this.webSocketManager.sendToUser(notification.userId, "notification", {
			id: Number(createdNotification.id),
			type: notification.type,
			message: notification.message,
		});
	}

	public async getNotifications(userId: number): Promise<SendNotificationDto[]> {
		const notifications = await this.prisma.notification.findMany({
			where: { sent_to_user_id: userId },
			orderBy: { created_at: "desc" },
		});

		return notifications.map((notification) => ({
			id: Number(notification.id),
			userId: Number(notification.sent_to_user_id),
			type: notification.type as "success" | "warning" | "info",
			message: notification.message,
			seen_at: notification.seen_at,
		}));
	}

	public async markNotificationAsSeen(userId: number, notificationId: number): Promise<void> {
		await this.prisma.notification.update({
			where: { id: notificationId, sent_to_user_id: userId },
			data: {
				seen_at: DateUtil.getNowWithoutMs(),
				updated_at: DateUtil.getNowWithoutMs(),
			},
		});
	}
}

export default NotificationService;
