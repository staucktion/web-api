import { Request, Response } from "express";
import CronDto from "src/dto/cron/CronDto";
import CustomError from "src/error/CustomError";
import CronService from "src/service/cron/CronService";
import AdminValidation from "src/validation/admin/AdminValidation";

class CronFacade {
	private adminValidation: AdminValidation;
	private cronService: CronService;

	constructor() {
		this.adminValidation = new AdminValidation();
		this.cronService = new CronService();
	}

	public async getCrons(req: Request, res: Response): Promise<void> {
		let cronDtoList: [CronDto];

		// get cron list
		try {
			cronDtoList = await this.cronService.getCrons();
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(200).json(cronDtoList);
		return;
	}
}

export default CronFacade;
