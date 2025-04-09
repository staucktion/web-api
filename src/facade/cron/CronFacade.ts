import { Request, Response } from "express";
import CronDto from "src/dto/cron/CronDto";
import CronUpdateDto from "src/dto/cron/CronUpdateDto";
import CustomError from "src/error/CustomError";
import CronService from "src/service/cron/CronService";
import CronValidation from "src/validation/cron/CronValidation";

class CronFacade {
	private cronValidation: CronValidation;
	private cronService: CronService;

	constructor() {
		this.cronValidation = new CronValidation();
		this.cronService = new CronService();
	}

	public async getCronList(req: Request, res: Response): Promise<void> {
		let cronDtoList: CronDto[];

		// get cron list
		try {
			cronDtoList = await this.cronService.getCronList();
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(200).json(cronDtoList);
		return;
	}

	public async updateCronList(req: Request, res: Response): Promise<void> {
		let cronUpdateDtoList: CronUpdateDto[];
		let updatedCronDtoList: CronDto[];

		// get valid body from request
		try {
			cronUpdateDtoList = await this.cronValidation.validateUpdateCronListRequest(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// update
		try {
			updatedCronDtoList = await this.cronService.updateCronList(cronUpdateDtoList);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(200).json(updatedCronDtoList);
		return;
	}
}

export default CronFacade;
