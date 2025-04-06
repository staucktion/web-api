import { Request, Response } from "express";
import Config from "src/config/Config";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import CustomError from "src/error/CustomError";
import AdminValidation from "src/validation/admin/AdminValidation";
import DbConfigFacade from "../dbConfig/DbConfigFacade";
class AdminFacade {
	private adminValidation: AdminValidation;
	private dbConfigFacade: DbConfigFacade;

	constructor() {
		this.adminValidation = new AdminValidation();
		this.dbConfigFacade = new DbConfigFacade();
	}

	public async getConfig(req: Request, res: Response): Promise<void> {
		let responseDto: Omit<DbConfigDto, "id"> = {
			voter_comission_percentage: Config.voterComissionPercentage,
			photographer_comission_percentage: Config.photographerComissionPercentage,
			is_timer_job_active: Config.isTimerActive,
		};
		res.status(200).json(responseDto);
	}

	public async setConfig(req: Request, res: Response): Promise<void> {
		let dbConfigDto: Omit<DbConfigDto, "id">;

		// get valid body from request
		try {
			dbConfigDto = await this.adminValidation.validateConfigRequest(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// validate comission amount
		try {
			await this.adminValidation.validateComissionAmount(dbConfigDto);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// save data
		try {
			await this.dbConfigFacade.setDbConfig(dbConfigDto);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// sync data
		try {
			await this.dbConfigFacade.syncDbConfig();
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}
}

export default AdminFacade;
