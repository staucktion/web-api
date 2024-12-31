import sharp from "sharp";
import CustomError from "src/error/CustomError";
import { Photo } from "src/types/photoTypes";
import * as fs from "fs";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";

class PhotoService {
	public async addTextWatermark(
		inputPath: string,
		outputPath: string,
		watermarkText: string,
		fontSize: number,
		opacity: number
	): Promise<void> {
		try {
			const image = sharp(inputPath);
			const { width, height } = await image.metadata();
			const horizontalSpacing = 30;
			const verticalSpacing = 15;

			// calculate the text length and adjust position based on watermark
			const textLength = watermarkText.length * (fontSize / 2);

			const horizontalCount = Math.ceil(
				Number(width) / (textLength + horizontalSpacing)
			);
			const verticalCount = Math.ceil(
				Number(height) / (fontSize + verticalSpacing)
			);

			const svgText = () => {
				let svgContent = "";
				for (let row = 0; row < verticalCount; row++) {
					for (let col = 0; col < horizontalCount; col++) {
						let x = col * (textLength + horizontalSpacing);
						if (row % 2 == 0) x += fontSize * 4;
						let y = row * (fontSize + verticalSpacing);
						svgContent += `<text x="${x}" y="${y}" class="watermark" text-anchor="middle" alignment-baseline="middle">${watermarkText}</text>`;
					}
				}
				return `
				  <svg width="${width}" height="${height}">
					<style>
					  .watermark {
						fill: rgba(255, 255, 255, ${opacity});
						font-size: ${fontSize}px;
						font-family: sans-serif;
						font-weight: bold;
					  }
					</style>
					${svgContent}
				  </svg>
				`;
			};

			const svgBuffer = Buffer.from(svgText());
			await image
				.composite([{ input: svgBuffer, top: 0, left: 0 }])
				.toFile(outputPath);
		} catch (error: any) {
			console.error("Error adding watermark:", error);
			CustomError.builder()
				.setErrorType("Server Error")
				.setClassName(this.constructor.name)
				.setMethodName("addTextWatermark")
				.setError(error)
				.build()
				.throwError();
			throw error;
		}
	}

	public async listPhotos(): Promise<Photo[]> {
		let photoFiles: string[];
		try {
			photoFiles = fs
				.readdirSync(WATERMARK_PHOTO_DIR)
				.filter(
					(file) =>
						file.endsWith(".jpg") ||
						file.endsWith(".jpeg") ||
						file.endsWith(".png")
				);
		} catch (err: any) {
			console.error("Error reading photos directory:", err);
			CustomError.builder()
				.setErrorType("Server Error")
				.setClassName(this.constructor.name)
				.setMethodName("listPhotos")
				.setError(err)
				.build()
				.throwError();
			throw err;
		}

		const photos: Photo[] = photoFiles.map(
			(file): Photo => ({
				filename: file,
				filepath: `/photo/view/static/${file}`,
			})
		);

		return photos;
	}
}

export default PhotoService;
