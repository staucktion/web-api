import { Request } from "express";
import CustomError from "src/error/CustomError";
import { MailAction } from "src/types/mailTypes";
import { isValidMailAction } from "src/util/mailUtil";

const mailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

class MailValidation {
	public async sendMailRequest(
		req: Request
	): Promise<{ photoName: string; action: MailAction; email: string }> {
		const { photoName, action, email } = req.body;

		if (!photoName) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("request does not include photo name")
				.build()
				.throwError();
		}

		if (!action) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("request does not include action")
				.build()
				.throwError();
		}

		if (!email) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("request does not include email")
				.build()
				.throwError();
		}

		if (!mailRegex.test(email)) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("email is not valid")
				.build()
				.throwError();
		}

		if (!isValidMailAction(action)) {
			console.log("Invalid action received:", action);
			console.log("Valid actions are:", Object.values(MailAction));
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("action is not valid")
				.build()
				.throwError();
		}

		return { photoName, action, email };
	}
}

export default MailValidation;
