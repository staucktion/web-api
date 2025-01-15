export default interface ErrorDto {
	errorType: string;
	stackTrace: string;
	message: string;
	statusCode: number;
	externalMessage: string;
}
