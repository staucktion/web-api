import { Request } from "express";
import UploadPhotoDto from "src/dto/photo/UploadPhotoDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

declare module "express" {
	interface Request {
		file?: { destination: string; filename: string };
	}
}

class PhotoValidation {
	public async uploadPhotoRequest(req: Request): Promise<UploadPhotoDto> {
		const uploadPhotoDto: UploadPhotoDto = req.file;
		const requiredFields: string[] = ["destination", "filename"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(uploadPhotoDto);
		} catch (error: any) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, uploadPhotoDto);
		} catch (error: any) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getBody().externalMessage}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return uploadPhotoDto;
	}
}

export default PhotoValidation;
