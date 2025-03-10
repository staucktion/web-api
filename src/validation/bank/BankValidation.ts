import { Request } from "express";
import CardDto from "src/dto/bank/CardDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class BankValidation {
	public async validateBankCredentials(req: Request): Promise<CardDto> {
		const input = req.body;
		const requiredFields: string[] = ["cardNumber", "expirationDate", "cvv"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error: any) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, input);
		} catch (error: any) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		const cardDto: CardDto = req.body;
		return cardDto;
	}
}

export default BankValidation;
