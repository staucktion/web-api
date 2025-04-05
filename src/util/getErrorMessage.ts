import CustomError from "src/error/CustomError";

export const getErrorMessage = (error: unknown): string => {
	return error instanceof Error ? error.message : error instanceof CustomError ? error.getDetailedMessage() : `Unknown Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
};
