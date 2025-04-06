import { getErrorMessage } from "./getErrorMessage";
import { hasKey } from "./tsUtil";

export const getResponseErrorMessage = (error: unknown): string => {
	return hasKey(error, "response") && hasKey(error.response, "data") && hasKey(error.response.data, "message") && typeof error.response.data.message === "string"
		? error.response.data.message
		: `Unknown error: ${getErrorMessage(error)}`;
};
