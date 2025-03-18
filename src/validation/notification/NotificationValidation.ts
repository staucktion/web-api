import { Request } from "express";
import NotificationDto from "src/dto/notification/NotificationDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class NotificationValidation {
	public async validateNotificationRequest(req: Request): Promise<NotificationDto> {
		const notificationDto = req.body;
		const requiredFields: string[] = ["userId", "type", "message"];
		const validTypes = ["success", "warning", "info"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(notificationDto);
		} catch (_error) {
			CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, notificationDto);
		} catch (error) {
			CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate notification type
		if (!validTypes.includes(notificationDto.type)) {
			CustomError.builder().setMessage("Invalid notification type. Must be one of: success, warning, info").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return notificationDto;
	}
}

export default NotificationValidation;
