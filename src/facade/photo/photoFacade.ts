import { Request, Response } from "express";
import * as fs from "fs";
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
			const files = fs.readdirSync(WATERMARK_PHOTO_DIR);

			// Yalnızca görsel dosyalarını filtrele (ör. .jpg, .png, .jpeg)
			const photoUrls = files.filter(
				(file) => file.match(/\.(jpg|jpeg|png|gif)$/i) // Yalnızca görselleri içeren bir regex
			);

			return res.status(200).json(photoUrls);
		} catch (error: any) {
			console.error("Error listing photos:", error);
			return res.status(500).json({ error: "Failed to list photos" });
		}
	}
}

export default PhotoFacade;
