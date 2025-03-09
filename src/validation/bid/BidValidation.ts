import { Request } from "express";
import CardDto from "src/dto/bank/CardDto";
import BidDto from "src/dto/bid/BidDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class BidValidation {
	public async bid(req: Request): Promise<BidDto> {
		const input = req.body;
		const requiredFields: string[] = ["bidAmount"];

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

		const bidDto: BidDto = req.body;
		return bidDto;
	}
}

export default BidValidation;
