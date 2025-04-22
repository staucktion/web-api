import { Request, Response } from "express";
import Config from "src/config/Config";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import CustomError from "src/error/CustomError";
import AdminValidation from "src/validation/admin/AdminValidation";
import DbConfigFacade from "../dbConfig/DbConfigFacade";
import UserService from "src/service/user/userService";
import sendJsonBigint from "src/util/sendJsonBigint";
import AdminUserValidation from "src/validation/admin/AdminUserValidation";

class AdminFacade {
	private adminValidation: AdminValidation;
	private adminUserValidation: AdminUserValidation;
	private dbConfigFacade: DbConfigFacade;
	private userService: UserService;

	constructor() {
		this.adminValidation = new AdminValidation();
		this.adminUserValidation = new AdminUserValidation();
		this.dbConfigFacade = new DbConfigFacade();
		this.userService = new UserService();
	}

	public async getConfig(req: Request, res: Response): Promise<void> {
		const responseDto: Omit<DbConfigDto, "id"> = {
			voter_comission_percentage: Config.voterComissionPercentage,
			photographer_comission_percentage: Config.photographerComissionPercentage,
			photos_to_auction_percentage: Config.photosToAuctionPercentage,
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

		// validate percentage amount
		try {
			await this.adminValidation.validatePercentageAmount(dbConfigDto);
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

	public async getAllUsers(req: Request, res: Response): Promise<void> {
		try {
			const users = await this.userService.getAllUsers();

			for (const user of users) {
				user.password = "---REDACTED---";
			}

			sendJsonBigint(res, users, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	}

	public async getUserById(req: Request, res: Response): Promise<void> {
		try {
			const userId = parseInt(req.params.userId);
			if (isNaN(userId)) {
				CustomError.builder().setMessage("Invalid user ID").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			const user = await this.userService.getAdminUserById(userId);

			user.password = "---REDACTED---";

			sendJsonBigint(res, user, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	}

	public async updateUser(req: Request, res: Response): Promise<void> {
		try {
			const userId = parseInt(req.params.userId);
			if (isNaN(userId)) {
				CustomError.builder().setMessage("Invalid user ID").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			// Validate request
			const updateUserDto = await this.adminUserValidation.validateAdminUpdateUserRequest(req);

			// Update user
			const updatedUser = await this.userService.updateUser(userId, updateUserDto);

			// Redact sensitive information
			updatedUser.password = "---REDACTED---";

			// Send response
			sendJsonBigint(res, updatedUser, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	}
}

export default AdminFacade;
