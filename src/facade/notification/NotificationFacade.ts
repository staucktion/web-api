import { Request, Response } from "express";
import NotificationDto from "src/dto/notification/NotificationDto";
import CustomError from "src/error/CustomError";
import NotificationService from "src/service/notification/NotificationService";
import NotificationValidation from "src/validation/notification/NotificationValidation";

class NotificationFacade {
	private notificationService: NotificationService;
	private notificationValidation: NotificationValidation;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
		this.notificationValidation = new NotificationValidation();
	}

	public async sendNotification(req: Request, res: Response): Promise<Response> {
		if (!req.user) {
			return res.status(401).send({ message: "Access Denied! No token provided." });
		}

		let notificationDto: NotificationDto;

		try {
			notificationDto = await this.notificationValidation.validateNotificationRequest(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		try {
			await this.notificationService.sendNotification(notificationDto);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		return res.status(204).send();
	}
}

export default NotificationFacade;
