import { Request } from "express";
import LoginDto from "src/dto/auth/LoginDto";
import RegisterDto from "src/dto/auth/RegisterDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

const unicodeNameRegex = new RegExp(/^[\p{L}\p{M} ]+$/u);

class AuthValidation {
	public async validateLoginRequest(req: Request): Promise<LoginDto> {
		const input = req.body;
		const requiredFields: string[] = ["email", "password"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate email format
		if (input.email && !this.isValidEmail(input.email)) {
			CustomError.builder().setMessage("Invalid email format.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		const loginDto: LoginDto = req.body;
		return loginDto;
	}

	public async validateRegisterRequest(req: Request): Promise<RegisterDto> {
		const input = req.body;
		const requiredFields: string[] = ["email", "password", "first_name", "last_name"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(input);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, input);
		} catch (error) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate email format
		if (input.email && !this.isValidEmail(input.email)) {
			CustomError.builder().setMessage("Invalid email format.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate password strength (at least 8 characters)
		if (input.password && input.password.length < 8) {
			CustomError.builder().setMessage("Password must be at least 8 characters long.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate name fields aren't empty strings
		if (input.first_name.trim() === "") {
			CustomError.builder().setMessage("First name cannot be empty.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (input.first_name.length > 50) {
			CustomError.builder().setMessage("First name cannot be longer than 50 characters.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (input.first_name.length < 2) {
			CustomError.builder().setMessage("First name cannot be shorter than 2 characters.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (!unicodeNameRegex.test(input.first_name)) {
			CustomError.builder().setMessage("First name can only contain letters and spaces.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (input.last_name.trim() === "") {
			CustomError.builder().setMessage("Last name cannot be empty.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (input.last_name.length > 50) {
			CustomError.builder().setMessage("Last name cannot be longer than 50 characters.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (input.last_name.length < 2) {
			CustomError.builder().setMessage("Last name cannot be shorter than 2 characters.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		if (!unicodeNameRegex.test(input.last_name)) {
			CustomError.builder().setMessage("Last name can only contain letters.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		const registerDto: RegisterDto = req.body;
		return registerDto;
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

export default AuthValidation;
