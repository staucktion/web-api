import { Request, Response } from "express";
import UpdateUserDto from "src/dto/user/UpdateUserDto";
import CustomError from "src/error/CustomError";
import UserService from "src/service/user/userService";
import UserValidation from "src/validation/user/UserValidation";
import sendJsonBigint from "src/util/sendJsonBigint";

class UserFacade {
	private userService: UserService;
	private userValidation: UserValidation;

	constructor() {
		this.userService = new UserService();
		this.userValidation = new UserValidation();
	}

	public handleUpdateUser = async (req: Request, res: Response): Promise<void> => {
		// Check if user is authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized: You must be logged in").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			// Validate request
			const updateUserDto: UpdateUserDto = await this.userValidation.validateUpdateUserRequest(req);

			// Update user
			const updatedUser = await this.userService.updateUser(req.user.id, updateUserDto);

			// Send response
			sendJsonBigint(
				res,
				{
					message: "User profile updated successfully",
					user: updatedUser,
				},
				200
			);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};
}

export default UserFacade;
