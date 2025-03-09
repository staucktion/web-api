import { Request, Response } from "express";
import Config from "src/config/Config";
import CardDto from "src/dto/bank/CardDto";
import CustomError from "src/error/CustomError";
import BankService from "src/service/bank/BankService";
import StatusService from "src/service/status/StatusService";
import UserService from "src/service/user/userService";
import BankValidation from "src/validation/bank/BankValidation";

class BankFacade {
	private bankService: BankService;
	private bankValidation: BankValidation;
	private userService: UserService;
	private statusService: StatusService;

	constructor() {
		this.bankService = new BankService();
		this.bankValidation = new BankValidation();
		this.userService = new UserService();
		this.statusService = new StatusService();
	}

	public async approveUser(req: Request, res: Response): Promise<void> {
		let cardDto: CardDto;
		let banUser: boolean = false;

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
			if (error.message === "Cannot perform bank api operation. Balance is not sufficient for provision.") banUser = true;
		}

		// ban user
		if (banUser)
			try {
				const bannedStatus = await this.statusService.getStatusFromName("banned");
				const dataToUpdateUser = { status_id: bannedStatus.id };
				await this.userService.updateUser(req.user.id, dataToUpdateUser);
				res.status(400).json({ message: "provision is not enough, user banned." });
				return;
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
		try {
			const activeStatus = await this.statusService.getStatusFromName("active");
			const dataToUpdateUser = { status_id: activeStatus.id };
			await this.userService.updateUser(req.user.id, dataToUpdateUser);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}
}

export default BankFacade;
