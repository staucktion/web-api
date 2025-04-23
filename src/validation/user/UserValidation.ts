import { Request } from "express";
import UpdateUserDto from "src/dto/user/UpdateUserDto";
import CustomError from "src/error/CustomError";

class UserValidation {
	public async validateUpdateUserRequest(req: Request): Promise<UpdateUserDto> {
		// Combine body data with file data if present
		const updateUserDto: UpdateUserDto = {
			...req.body,
			profile_picture: req.file?.filename,
		};

		// Check if at least one field is provided
		if (!this.hasAtLeastOneField(updateUserDto)) {
			CustomError.builder().setMessage("At least one field must be provided for update.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// Validate tc_identity_no if provided (must be 11 digits)
		if (updateUserDto.tc_identity_no) {
			const tcRegex = /^[0-9]{11}$/;
			if (!tcRegex.test(updateUserDto.tc_identity_no)) {
				CustomError.builder().setMessage("TC Identity number must be 11 digits.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			if (parseInt(updateUserDto.tc_identity_no[0]) === 0) {
				CustomError.builder().setMessage("TC Identity number cannot start with 0.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			let oddSum = 0,
				evenSum = 0,
				totalSum = 0;
			for (let i = 0; i <= 8; i++) {
				if (i % 2 === 0) {
					oddSum += parseInt(updateUserDto.tc_identity_no[i]);
				} else {
					evenSum += parseInt(updateUserDto.tc_identity_no[i]);
				}
				totalSum += parseInt(updateUserDto.tc_identity_no[i]);
			}

			oddSum = oddSum * 7;
			const validationNumber = (oddSum - evenSum) % 10;

			if (validationNumber !== parseInt(updateUserDto.tc_identity_no[9])) {
				CustomError.builder().setMessage("TC Identity number is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}

			totalSum += parseInt(updateUserDto.tc_identity_no[9]);
			if (totalSum % 10 !== parseInt(updateUserDto.tc_identity_no[10])) {
				CustomError.builder().setMessage("TC Identity number is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
			}
		}

		// Validate name and surname if provided
		if (updateUserDto.first_name && updateUserDto.first_name.trim() === "") {
			CustomError.builder().setMessage("First name cannot be empty.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (updateUserDto.last_name && updateUserDto.last_name.trim() === "") {
			CustomError.builder().setMessage("Last name cannot be empty.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (updateUserDto.username && updateUserDto.username.trim() === "") {
			CustomError.builder().setMessage("Username cannot be empty.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return updateUserDto;
	}

	private hasAtLeastOneField(dto: UpdateUserDto): boolean {
		return !!(dto.first_name || dto.last_name || dto.tc_identity_no || dto.profile_picture || dto.username);
	}
}

export default UserValidation;
