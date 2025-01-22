import { Request } from "express";
import GetPhotoRequestDto from "src/dto/error/GetPhotoRequestDto";
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
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		return uploadPhotoDto;
	}

	public async getPhotoRequest(req: Request): Promise<GetPhotoRequestDto> {
		const requiredFields: string[] = ["photoId"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(req.params);
		} catch (error: any) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, req.params);
		} catch (error: any) {
			if (error instanceof CustomError)
				CustomError.builder().setMessage(`Request body is invalid. ${error.getDetailedMessage()}`).setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		const getPhotoRequestDto: GetPhotoRequestDto = { photoId: req.params.photoId };
		return getPhotoRequestDto;
	}
}

export default PhotoValidation;
