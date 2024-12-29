import { Request } from "express";
import CustomError from "src/error/CustomError";

declare module "express" {
	interface Request {
		file?: { destination: string; filename: string };
	}
}

class PhotoValidation {
	public async uploadPhotoRequest(
		req: Request
	): Promise<{ photoSource: string; photoName: string }> {
		// validate input photo
		if (!req.file) {
			CustomError.builder()
				.setErrorType("Input Validation Error")
				.setClassName(this.constructor.name)
				.setMethodName("uploadPhotoRequest")
				.setMessage("request does not include photo file")
				.build()
				.throwError();
			throw Error(
				"This throw is unreachable, but required for compilation at the moment due to CustomError.throwError() being a void function."
			);
		}

		const photoSource = req.file.destination;
		const photoName = req.file.filename;
		return { photoSource, photoName };
	}
}

export default PhotoValidation;
