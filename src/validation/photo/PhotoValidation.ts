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
		const uploadPhotoDto: UploadPhotoDto = { ...req.file, categoryId: req.body.categoryId, deviceInfo: req.body.deviceInfo };
		const requiredFields: string[] = ["destination", "filename", "categoryId", "deviceInfo"];

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

		const categoryId = Number(uploadPhotoDto.categoryId);
		if (isNaN(categoryId)) CustomError.builder().setMessage("Category ID is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

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

		const photoId = Number(req.params.photoId);
		if (isNaN(photoId)) CustomError.builder().setMessage("Photo ID is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		const getPhotoRequestDto: GetPhotoRequestDto = { photoId };
		return getPhotoRequestDto;
	}

	public async validateApproveRejectRequest(req: Request): Promise<{ photoId: number; action: string; reason?: string }> {
		// Extract photoId from URL params
		const photoId = parseInt(req.params.photoId);
		if (isNaN(photoId)) {
			CustomError.builder().setErrorType("Bad Request").setStatusCode(400).setMessage("Photo ID must be a valid number").build().throwError();
		}

		// Validate the request body
		if (!req.body) {
			CustomError.builder().setErrorType("Bad Request").setStatusCode(400).setMessage("Request body is required").build().throwError();
		}

		// Validate action
		const { action, reason } = req.body;
		if (!action) {
			CustomError.builder().setErrorType("Bad Request").setStatusCode(400).setMessage("Action is required").build().throwError();
		}

		if (action !== "approve" && action !== "reject") {
			CustomError.builder().setErrorType("Bad Request").setStatusCode(400).setMessage("Action must be either 'approve' or 'reject'").build().throwError();
		}

		// If action is reject, reason is required
		if (action === "reject" && !reason) {
			CustomError.builder().setErrorType("Bad Request").setStatusCode(400).setMessage("Reason is required when rejecting a photo").build().throwError();
		}

		return { photoId, action, reason };
	}
}

export default PhotoValidation;
