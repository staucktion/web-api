import { Request, Response } from "express";
import Config from "src/config/Config";
import ComissionDto from "src/dto/comission/ComissionDto";
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

	public async getComissionConfig(req: Request, res: Response): Promise<void> {
		let responseDto: ComissionDto = { voterComissionPercentage: Config.voterComissionPercentage, photographerComissionPercentage: Config.photographerComissionPercentage };
		res.status(200).json(responseDto);
	}

	public async changeComissionConfig(req: Request, res: Response): Promise<void> {
		let comissionDto: ComissionDto;

		// get valid body from request
		try {
			comissionDto = await this.adminValidation.validateComissionRequest(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// validate comission amount
		try {
			await this.adminValidation.validateComissionAmount(comissionDto);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// fetch existing data
		let oldDbConfigDto: DbConfigDto;
		try {
			oldDbConfigDto = await this.dbConfigFacade.getDbConfig();
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// create new data
		const newDbConfigDto = {
			...oldDbConfigDto,
			voter_comission_percentage: comissionDto.voterComissionPercentage,
			photographer_comission_percentage: comissionDto.photographerComissionPercentage,
		};

		// save new data
		try {
			await this.dbConfigFacade.setDbConfig(newDbConfigDto);
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
