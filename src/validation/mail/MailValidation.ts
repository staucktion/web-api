import { Request } from "express";
import EmailDto from "src/dto/email/EmailDto";
import CustomError from "src/error/CustomError";
import { isValidMailAction } from "src/util/mailUtil";
import ValidationUtil from "src/util/ValidationUtil";

const mailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

class MailValidation {
	public async sendMailRequest(req: Request): Promise<EmailDto> {
		const emailDto = req.body;
		const requiredFields: string[] = ["photoName", "action", "email"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(emailDto);
		} catch (error: any) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, emailDto);
		} catch (error: any) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate email
		if (!mailRegex.test(emailDto.email)) {
			CustomError.builder().setMessage(`Email is not valid.`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate action
		if (!isValidMailAction(emailDto.action)) {
			CustomError.builder().setMessage(`Action is not valid.`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return emailDto;
	}
}

export default MailValidation;
