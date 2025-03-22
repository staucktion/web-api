interface ErrorDto {
	errorType: string;
	stackTrace: string;
	message: string;
	statusCode: number;
	detailedMessage: string;
}

export default ErrorDto;
