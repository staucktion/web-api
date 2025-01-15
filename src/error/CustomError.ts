import ErrorDto from "src/dto/error/ErrorDto";

class CustomError {
	private readonly errorType: string;
	private readonly statusCode: number;
	private readonly stackTrace: string;
	private readonly message: string;
	private readonly externalMessage: string;

	private constructor(errorType: string, statusCode: number, message: string, externalMessage: string) {
		this.errorType = errorType;
		this.statusCode = statusCode;
		this.stackTrace = new Error().stack;
		this.message = message;
		this.externalMessage = externalMessage;
	}

	public static builder() {
		return new this.Builder();
	}

	public getBody(): ErrorDto {
		const errorBody: any = {
			errorType: this.errorType,
			statusCode: this.statusCode,
			stackTrace: this.stackTrace,
			message: this.message,
			externalMessage: this.externalMessage,
		};

		return errorBody;
	}

	public getStatusCode(): number {
		return this.statusCode;
	}

	public getMessage(): object {
		return { message: this.message };
	}

	public log() {
		console.error("[ERROR]");
		console.error(this.getBody());
	}

	public throwError(): CustomError {
		throw this;
	}

	// nested builder class
	private static Builder = class {
		private errorType: string;
		private statusCode: number;
		private message: string;
		private externalMessage: string;

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

		public setExternalMessage(externalMessage: string): this {
			this.externalMessage = externalMessage;
			return this;
		}

		public build(): CustomError {
			return new CustomError(this.errorType, this.statusCode, this.message, this.externalMessage);
		}
	};
}

export default CustomError;
