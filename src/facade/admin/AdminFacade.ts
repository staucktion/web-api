import { Request, Response } from "express";
import Config from "src/config/Config";
import ComissionDto from "src/dto/comission/ComissionDto";
import CustomError from "src/error/CustomError";
import AdminValidation from "src/validation/admin/AdminValidation";
class AdminFacade {
	private adminValidation: AdminValidation;

	constructor() {
		this.adminValidation = new AdminValidation();
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

		// set new amounts
		Config.voterComissionPercentage = comissionDto.voterComissionPercentage;
		Config.photographerComissionPercentage = comissionDto.photographerComissionPercentage;

		res.status(204).send();
	}
}

export default AdminFacade;
