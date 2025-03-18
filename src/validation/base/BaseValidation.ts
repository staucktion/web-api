import { Request } from "express";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class BaseValidation {
	public async params(req: Request, requiredFields: string[]): Promise<any> {
		const input = req.params;

		// validate request params
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request params is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request params is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return req.params;
	}
}

export default BaseValidation;
