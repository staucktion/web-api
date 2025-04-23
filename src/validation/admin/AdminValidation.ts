import { Request } from "express";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class AdminValidation {
	public async validateConfigRequest(req: Request): Promise<Omit<DbConfigDto, "id">> {
		const input = req.body;
		const requiredFields: string[] = ["voter_comission_percentage", "photographer_comission_percentage", "photos_to_auction_percentage", "is_timer_job_active"];
		const numericFields: string[] = ["voter_comission_percentage", "photographer_comission_percentage", "photos_to_auction_percentage"];

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

		const dbConfigDto: Omit<DbConfigDto, "id"> = req.body;
		return dbConfigDto;
	}

	public async validatePercentageAmount(dbConfigDto: Omit<DbConfigDto, "id">): Promise<void> {
		if (dbConfigDto.photographer_comission_percentage < 0 || dbConfigDto.voter_comission_percentage < 0 || dbConfigDto.photos_to_auction_percentage < 0)
			CustomError.builder()
				.setMessage(
					`Percentage value cannot be lower than 0, current values are: photographer ${dbConfigDto.photographer_comission_percentage}, voter ${dbConfigDto.voter_comission_percentage}, auction ${dbConfigDto.photos_to_auction_percentage}`
				)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();

		if (dbConfigDto.photographer_comission_percentage + dbConfigDto.voter_comission_percentage > 100)
			CustomError.builder()
				.setMessage(`Total comission amount is cannot be higher than 100, current is ${dbConfigDto.photographer_comission_percentage + dbConfigDto.voter_comission_percentage}`)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();

		if (dbConfigDto.photos_to_auction_percentage > 100)
			CustomError.builder()
				.setMessage(`Percentage of the photos which will be auctioned cannot be higher than 100, current is ${dbConfigDto.photos_to_auction_percentage}`)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();
	}
}

export default AdminValidation;
