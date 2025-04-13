import { Request } from "express";
import CronUpdateDto from "src/dto/cron/CronUpdateDto";
import CustomError from "src/error/CustomError";
import { cronEnum } from "src/types/cronEnum";
import DateUtil from "src/util/dateUtil";
import ValidationUtil from "src/util/ValidationUtil";

class CronValidation {
	public async validateUpdateCronListRequest(req: Request): Promise<CronUpdateDto[]> {
		const input = req.body;
		const requiredFields: string[] = ["id", "unit", "interval"];
		const numericFields: string[] = ["id", "interval"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate array
		try {
			ValidationUtil.checkArrayData(input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		for (const cronUpdateDto of input) {
			// validate required fields
			try {
				ValidationUtil.checkRequiredFields(requiredFields, cronUpdateDto);
			} catch (error) {
				if (error instanceof CustomError)
					CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			// check numeric field
			try {
				ValidationUtil.validateNumericFieldsOfObject(numericFields, cronUpdateDto);
			} catch (error) {
				if (error instanceof CustomError)
					CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			// assign numeric field
			try {
				ValidationUtil.assignNumericFieldsOnObject(numericFields, cronUpdateDto);
			} catch (error) {
				if (error instanceof CustomError)
					CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}
		}

		const cronUpdateDtoList: CronUpdateDto[] = req.body;

		// check fields
		for (const cronUpdateDto of cronUpdateDtoList) {
			if (!Object.values(cronEnum).includes(cronUpdateDto.id))
				CustomError.builder()
					.setMessage(`Invalid id ${cronUpdateDto.id}, valid ids: ${Object.values(cronEnum)} `)
					.setErrorType("Input Validation")
					.setStatusCode(400)
					.build()
					.throwError();

			if (!["s", "m", "h", "d", "w"].includes(cronUpdateDto.unit))
				CustomError.builder().setMessage(`Invalid unit ${cronUpdateDto.unit}, Valid units are: s,m,h,d,w`).setErrorType("Input Validation").setStatusCode(400).build().throwError();

			if (cronUpdateDto.interval <= 0)
				CustomError.builder()
					.setMessage(`Invalid interval: ${cronUpdateDto.interval}, it cannot be lower or equal to zero`)
					.setErrorType("Input Validation")
					.setStatusCode(400)
					.build()
					.throwError();

			// validate input is not bigger than 23 day because set interval not accept it
			const MAX_TIMEOUT = 2147483647;
			const currentMs = DateUtil.convertToMilliseconds(cronUpdateDto.interval, cronUpdateDto.unit);
			if (currentMs > MAX_TIMEOUT)
				CustomError.builder()
					.setMessage(`Invalid interval: ${currentMs}, it exceeds the maximum allowed value of ${MAX_TIMEOUT} milliseconds`)
					.setErrorType("Input Validation")
					.setStatusCode(400)
					.build()
					.throwError();
		}

		return cronUpdateDtoList;
	}
}

export default CronValidation;
