import { Request } from "express";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class AdminValidation {
	public async validateConfigRequest(req: Request): Promise<Omit<DbConfigDto, "id">> {
		const input = req.body;
		const requiredFields: string[] = ["voter_comission_percentage", "photographer_comission_percentage", "is_timer_job_active"];
		const numericFields: string[] = ["voter_comission_percentage", "photographer_comission_percentage"];

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

	public async validateComissionAmount(dbConfigDto: Omit<DbConfigDto, "id">): Promise<void> {
		if (dbConfigDto.photographer_comission_percentage + dbConfigDto.voter_comission_percentage > 100)
			CustomError.builder()
				.setMessage(`Total comission amount is cannot be higher than 100, current is ${dbConfigDto.photographer_comission_percentage + dbConfigDto.voter_comission_percentage}`)
				.setErrorType("Input Validation")
				.setStatusCode(400)
				.build()
				.throwError();
	}
}

export default AdminValidation;
