import { Request } from "express";
import CustomError from "src/error/CustomError";

declare module "express" {
	interface Request {
		file: { destination: string; filename: string };
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
				.setMethodName("getAccountFromCardRequest")
				.setMessage("request not include photo file")
				.build()
				.throwError();
		}

		const photoSource = req.file.destination;
		const photoName = req.file.filename;
		return { photoSource, photoName };
	}
}

export default PhotoValidation;
