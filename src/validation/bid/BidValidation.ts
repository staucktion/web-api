import { Request } from "express";
import BidDto from "src/dto/bid/BidDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class BidValidation {
	public async bid(req: Request): Promise<BidDto> {
		const input = req.body;
		const requiredFields: string[] = ["bidAmount"];
		const numericFields: string[] = ["bidAmount"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// check numeric field
		try {
			ValidationUtil.validateNumericFieldsOfObject(numericFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// assign numeric field
		try {
			ValidationUtil.assignNumericFieldsOnObject(numericFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		const bidDto: BidDto = req.body;
		return bidDto;
	}
}

export default BidValidation;
