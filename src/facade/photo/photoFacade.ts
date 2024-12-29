import { Request, Response } from "express";
import Config from "src/config/Config";
import PhotoService from "src/service/photo/photoService";
import PhotoValidation from "src/validation/photo/PhotoValidation";

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
				`./storage/watermark/${photoName}`,
				Config.watermark.text,
				Config.watermark.fontSize,
				Config.watermark.transparency
			);
		} catch (error: any) {
			return res.status(500).send(error.message);
		}

		return res.status(200).send({ message: "Photo uploaded successfully" });
	}
}

export default PhotoFacade;
