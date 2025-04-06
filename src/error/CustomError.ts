import { Response } from "express";
import Config from "src/config/Config";
import ErrorDto from "src/dto/error/ErrorDto";

class CustomError {
	private readonly errorType: string;
	private readonly statusCode: number;
	private readonly stackTrace: string;
	private readonly message: string;
	private readonly detailedMessage: string;

	private constructor(errorType: string, statusCode: number, message: string, detailedMessage: string) {
		this.errorType = errorType;
		this.statusCode = statusCode;
		this.stackTrace = new Error().stack;
		this.message = message;
		this.detailedMessage = detailedMessage;
	}

	public static builder() {
		return new this.Builder();
	}

	public getBody(): ErrorDto {
		return {
			errorType: this.errorType,
			statusCode: this.statusCode,
			stackTrace: this.stackTrace,
			message: this.message,
			detailedMessage: this.detailedMessage,
		};
	}

	public getErrorType(): string {
		return this.errorType;
	}

	public getDetailedMessage(): string {
		return this.detailedMessage;
	}

	public getStatusCode(): number {
		return this.statusCode;
	}

	public getResponseMessage(): object {
		return { message: this.message };
	}

	public log() {
		console.error("[ERROR]");
		console.error(this.getBody());
	}

	public throwError(): CustomError {
		throw this;
	}

	public static handleError(res: Response, error: unknown): void {
		const isCustomError = error instanceof CustomError;
		if (Config.explicitErrorLog)
			if (isCustomError) error.log();
			else console.error("[ERROR] ", error);

		res.status(isCustomError ? error.getStatusCode() : 500).send(isCustomError ? error.getResponseMessage() : { message: "no message" });
	}

	public static handleSystemError(error: unknown): void {
		const isCustomError = error instanceof CustomError;
		if (isCustomError) error.log();
		else console.error("[ERROR] ", error);
	}

	// nested builder class
	private static Builder = class {
		private errorType: string;
		private statusCode: number;
		private message: string;
		private detailedMessage: string;

		public setErrorType(errorType: string): this {
			this.errorType = errorType;
			return this;
		}

		public setStatusCode(statusCode: number): this {
			this.statusCode = statusCode;
			return this;
		}

		public setMessage(message: string): this {
			this.message = message;
			return this;
		}

		public setDetailedMessage(detailedMessage: string): this {
			this.detailedMessage = detailedMessage;
			return this;
		}

		public build(): CustomError {
			return new CustomError(this.errorType, this.statusCode, this.message, this.detailedMessage);
		}
	};
}

export default CustomError;
