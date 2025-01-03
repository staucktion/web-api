import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import PhotoService from "src/service/photo/photoService";

class PhotoFacade {
	private photoService: PhotoService;

	constructor() {
		this.photoService = new PhotoService();
	}

	public async uploadPhoto(req: Request, res: Response): Promise<Response> {
		try {
			const photoName = req.file?.filename || "";
			const originalPath = path.join(
				req.file?.destination || "",
				photoName
			); // Construct full file path
			const watermarkedPath = path.join(WATERMARK_PHOTO_DIR, photoName);

			// Add watermark to uploaded photo
			await this.photoService.addTextWatermark(
				originalPath, // Use constructed path
				watermarkedPath,
				"Watermark Text", // Replace with your desired watermark
				12, // Font size
				0.5 // Transparency
			);

			return res.status(200).json({
				message: "Photo uploaded successfully",
				watermarkedPath: photoName,
			});
		} catch (error: any) {
			console.error("Error uploading photo:", error);
			return res.status(500).json({ error: "Failed to upload photo" });
		}
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
