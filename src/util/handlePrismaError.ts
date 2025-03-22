import { Prisma } from "@prisma/client";
import { hasKey } from "./tsUtil";
import CustomError from "src/error/CustomError";

export default function handlePrismaError(error: unknown): void {
	const custError = CustomError.builder().setStatusCode(500).setMessage("Cannot perform database operation.");
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		custError.setErrorType("Prisma Error").setDetailedMessage(error.message);
	} else if (hasKey(error, "message") && typeof error.message === "string") {
		custError.setErrorType("Unknown Error").setDetailedMessage(error.message);
	} else {
		console.error(error);
		custError.setErrorType("Unknown Error").setDetailedMessage("Unknown error, see logs for more details.");
	}

	custError.build().throwError();
}
