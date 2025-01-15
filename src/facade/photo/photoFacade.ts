import { Request, Response } from "express";
import * as path from "path";
import Config from "src/config/Config";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import GetPhotoRequestDto from "src/dto/error/GetPhotoRequestDto";
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

	public async uploadPhoto(req: Request, res: Response): Promise<void> {
		let uploadPhotoDto: UploadPhotoDto;

		// get valid body from request
		try {
			uploadPhotoDto = await this.photoValidation.uploadPhotoRequest(req);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}

		// add watermark to the uploaded photo
		try {
			await this.photoService.addTextWatermark(`${uploadPhotoDto.destination}${uploadPhotoDto.filename}`, path.join(WATERMARK_PHOTO_DIR, uploadPhotoDto.filename), Config.watermark.text);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}

		res.status(204).send();
		return;
	}

	public async listPhotos(_req: Request, res: Response): Promise<void> {
		try {
			const photoNames = await this.photoService.listPhotos();
			res.status(200).send(photoNames);
			return;
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}
	}

	public async getPhoto(req: Request, res: Response): Promise<void> {
		let getPhotoRequestDto: GetPhotoRequestDto;

		// get valid body from request
		try {
			getPhotoRequestDto = await this.photoValidation.getPhotoRequest(req);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}

		try {
			const photoPath = await this.photoService.getPhotoPath(getPhotoRequestDto.photoId);
			res.sendFile(photoPath);
			return;
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}
	}
}

export default PhotoFacade;
