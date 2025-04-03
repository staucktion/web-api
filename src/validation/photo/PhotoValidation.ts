import { Request } from "express";
import GetPhotoRequestDto from "src/dto/error/GetPhotoRequestDto";
import UploadPhotoDto from "src/dto/photo/UploadPhotoDto";
import CustomError from "src/error/CustomError";
import ValidationUtil from "src/util/ValidationUtil";

class PhotoValidation {
	public async uploadPhotoRequest(req: Request): Promise<UploadPhotoDto> {
		const uploadPhotoDto: UploadPhotoDto = { ...req.file, categoryId: req.body.categoryId, deviceInfo: req.body.deviceInfo };
		const requiredFields: string[] = ["destination", "filename", "categoryId", "deviceInfo"];

		// validate request body
		try {
			ValidationUtil.checkObjectExistence(uploadPhotoDto);
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, uploadPhotoDto);
		} catch (error) {
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
		} catch (error) {
			if (error instanceof CustomError) CustomError.builder().setMessage("Request body is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}

		// validate required fields
		try {
			ValidationUtil.checkRequiredFields(requiredFields, req.params);
		} catch (error) {
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

	public async updatePhotoPurchaseNowPriceRequest(req: Request): Promise<{ photoId: number; price: number | null }> {
		const photoId = parseInt(req.params.photoId);
		if (isNaN(photoId)) CustomError.builder().setMessage("Photo ID is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		const price = req.body.price;
		if (price === undefined) CustomError.builder().setMessage("Price is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		const priceNumber = price === null ? null : Number(price);
		if (priceNumber !== null && isNaN(priceNumber)) CustomError.builder().setMessage("Price is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		if (priceNumber !== null && priceNumber <= 0) CustomError.builder().setMessage("Price must be greater than 0.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		return { photoId, price: priceNumber };
	}

	public async updatePhotoAuctionableStatusRequest(req: Request): Promise<{ photoId: number; auctionable: boolean }> {
		const photoId = parseInt(req.params.photoId);
		if (isNaN(photoId)) CustomError.builder().setMessage("Photo ID is invalid.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		const auctionable = req.body.auctionable;
		if (auctionable === undefined) CustomError.builder().setMessage("Auctionable is required.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		let auctionableParsed: boolean;
		try {
			auctionableParsed = JSON.parse(auctionable);
		} catch (_error) {
			CustomError.builder().setMessage("Auctionable must be a boolean.").setErrorType("Input Validation").setStatusCode(400).build().throwError();
		}
		if (typeof auctionableParsed !== "boolean") CustomError.builder().setMessage("Auctionable must be a boolean.").setErrorType("Input Validation").setStatusCode(400).build().throwError();

		return { photoId, auctionable };
	}
}

export default PhotoValidation;
