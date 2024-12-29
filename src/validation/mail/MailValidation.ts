import { Request } from "express";
import CustomError from "src/error/CustomError";
import { MailAction } from "src/types/mailTypes";
import { isValidMailAction } from "src/util/mailUtil";

class MailValidation {
	public async sendMailRequest(
		req: Request
	): Promise<{ photoName: string; action: MailAction }> {
		const { photoName, action } = req.body;

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

		if (!isValidMailAction(action)) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMailRequest")
				.setMessage("action is not valid")
				.build()
				.throwError();
		}

		return { photoName, action };
	}
}

export default MailValidation;
