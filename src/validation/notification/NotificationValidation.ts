import { Request } from "express";
import SendNotificationDto from "src/dto/notification/SendNotificationDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class NotificationValidation {
	public async validateNotificationRequest(req: Request): Promise<SendNotificationDto> {
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
			CustomError.builder()
				.setMessage(`Request body is invalid. ${error instanceof CustomError ? error.getDetailedMessage() : "Unknown error"}`)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();
		}

		// validate notification type
		if (!validTypes.includes(notificationDto.type)) {
			CustomError.builder().setMessage("Invalid notification type. Must be one of: success, warning, info").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return notificationDto;
	}

	public async validateNotificationSeenRequest(req: Request): Promise<{ notification_id: number }> {
		const reqBody = req.body;
		const requiredFields: string[] = ["notification_id"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(reqBody);
		} catch (_error) {
			CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, reqBody);
		} catch (error) {
			CustomError.builder()
				.setMessage(`Request body is invalid. ${error instanceof CustomError ? error.getDetailedMessage() : "Unknown error"}`)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();
		}

		return reqBody;
	}
}

export default NotificationValidation;
