import { Request, Response } from "express";
import Config from "src/config/Config";
import PhotoService from "src/service/photo/photoService";
import PhotoValidation from "src/validation/photo/PhotoValidation";
import * as path from "path";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import { Photo } from "src/types/photoTypes";

class PhotoFacade {
	private photoService: PhotoService;
	private photoValidation: PhotoValidation;

	constructor() {
		this.photoService = new PhotoService();
		this.photoValidation = new PhotoValidation();
	}

	public async uploadPhoto(req: Request, res: Response): Promise<Response> {
		let photoSource: string, photoName: string;

		// get valid body from request
		try {
			({ photoSource, photoName } =
				await this.photoValidation.uploadPhotoRequest(req));
		} catch (e: any) {
			return res.status(400).send({ error: e.message });
		}

		// Add a watermark to the uploaded photo
		try {
			await this.photoService.addTextWatermark(
				`${photoSource}${photoName}`,
				path.join(WATERMARK_PHOTO_DIR, photoName),
				Config.watermark.text,
				Config.watermark.fontSize,
				Config.watermark.transparency
			);
		} catch (error: any) {
			return res.status(500).send(error.message);
		}

		return res.status(200).send({ message: "Photo uploaded successfully" });
	}

	public async listPhotos(_req: Request, res: Response): Promise<Response> {
		let photos: Photo[];

		try {
			photos = await this.photoService.listPhotos();
		} catch (error: any) {
			return res.status(500).send(error.message);
		}

		return res.status(200).send(photos);
	}
}

export default PhotoFacade;
