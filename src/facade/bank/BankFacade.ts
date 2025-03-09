import { Request, Response } from "express";
import Config from "src/config/Config";
import CardDto from "src/dto/bank/CardDto";
import CustomError from "src/error/CustomError";
import BankService from "src/service/bank/BankService";
import BankValidation from "src/validation/bank/BankValidation";

class BankFacade {
	private bankService: BankService;
	private bankValidation: BankValidation;

	constructor() {
		this.bankService = new BankService();
		this.bankValidation = new BankValidation();
	}

	public async approveUser(req: Request, res: Response): Promise<void> {
		let cardDto: CardDto;

		// get valid body from request
		try {
			cardDto = await this.bankValidation.approveUser(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// add provision
		try {
			await this.bankService.addProvision({ ...cardDto, provision: Config.provisionAmount });
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// remove provision
		try {
			await this.bankService.removeProvision({ ...cardDto, provision: Config.provisionAmount });
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// activate user
		// try {
		// 	const dataToUpdateUser = { ...photo, auction_id: createdAuction.id, status_id: voteStatus.id };
		// 	await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
		// } catch (error: any) {
		// 	CustomError.handleError(res, error);
		// 	return;
		// }

		res.status(204).send();
	}
}

export default BankFacade;
