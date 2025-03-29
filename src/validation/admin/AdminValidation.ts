import { Request } from "express";
import CardDto from "src/dto/bank/CardDto";
import ComissionDto from "src/dto/comission/ComissionDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class AdminValidation {
	public async validateComissionRequest(req: Request): Promise<ComissionDto> {
		const input = req.body;
		const requiredFields: string[] = ["voterComissionPercentage", "photographerComissionPercentage"];
		const numericFields: string[] = ["voterComissionPercentage", "photographerComissionPercentage"];

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

		const comissionDto: ComissionDto = req.body;
		return comissionDto;
	}
	
	public async validateComissionAmount(comisisonDto: ComissionDto): Promise<void> {
		if (comisisonDto.photographerComissionPercentage + comisisonDto.voterComissionPercentage > 100)
			CustomError.builder().setMessage(`Total comission amount is cannot be higher than 100`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
	}
}

export default AdminValidation;
