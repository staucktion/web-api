import { Request } from "express";
import AdminUpdateUserDto from "src/dto/user/AdminUpdateUserDto";
import CustomError from "src/error/CustomError";
import { StatusEnum } from "src/types/statusEnum";
import { RoleEnum } from "src/types/roleEnum";

class AdminUserValidation {
	public async validateAdminUpdateUserRequest(req: Request): Promise<AdminUpdateUserDto> {
		const updateData: AdminUpdateUserDto = req.body;

		// Check if at least one field is provided
		if (!this.hasAtLeastOneField(updateData)) {
			CustomError.builder().setMessage("At least one field (status_id or role_id) must be provided for update.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// Validate status_id if provided
		if (updateData.status_id !== undefined) {
			if (![StatusEnum.BANNED, StatusEnum.ACTIVE].includes(updateData.status_id)) {
				CustomError.builder().setMessage(`Invalid status_id. Must be either BANNED (${StatusEnum.BANNED}) or ACTIVE (${StatusEnum.ACTIVE}).`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// Validate role_id if provided
		if (updateData.role_id !== undefined) {
			if (!Object.values(RoleEnum).includes(updateData.role_id)) {
				CustomError.builder().setMessage("Invalid role_id. Must be a valid role enum value or null.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			if (updateData.role_id === RoleEnum.ADMIN) {
				CustomError.builder().setMessage("Admin role can only be assigned by the system.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}
		}

		return updateData;
	}

	private hasAtLeastOneField(dto: AdminUpdateUserDto): boolean {
		return dto.status_id !== undefined || dto.role_id !== undefined;
	}
}

export default AdminUserValidation;
