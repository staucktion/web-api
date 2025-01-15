import { Request, Response } from "express";
import * as path from "path";
import Config from "src/config/Config";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import UploadPhotoDto from "src/dto/photo/UploadPhotoDto";
import CustomError from "src/error/CustomError";
import PhotoService from "src/service/photo/photoService";
import PhotoValidation from "src/validation/photo/PhotoValidation";

class PhotoFacade {
	private photoService: PhotoService;
	private photoValidation: PhotoValidation;

	constructor() {
		this.photoValidation = new PhotoValidation();
		this.photoService = new PhotoService();
	}

	public async uploadPhoto(req: Request, res: Response): Promise<Response> {
		let uploadPhotoDto: UploadPhotoDto;

		// get valid body from request
		try {
			uploadPhotoDto = await this.photoValidation.uploadPhotoRequest(req);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				return res.status(error.getStatusCode()).send(error.getMessage());
			}
		}

		// add watermark to the uploaded photo
		try {
			await this.photoService.addTextWatermark(`${uploadPhotoDto.destination}${uploadPhotoDto.filename}`, path.join(WATERMARK_PHOTO_DIR, uploadPhotoDto.filename), Config.watermark.text);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				return res.status(error.getStatusCode()).send(error.getMessage());
			}
		}

		return res.status(204).send();
	}

	public async listPhotos(_req: Request, res: Response): Promise<Response> {
		try {
			const photoNames = await this.photoService.listPhotos();
			return res.status(200).send(photoNames);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				return res.status(error.getStatusCode()).send(error.getMessage());
			}
		}
	}
}

export default PhotoFacade;
