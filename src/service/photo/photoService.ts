import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path from "path";
import sharp from "sharp";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import UserDto from "src/dto/auth/UserDto";
import BaseResponseDto from "src/dto/base/BaseResponseDto";
import ReadAllPhotoResponseDto from "src/dto/photo/ReadAllPhotoResponseDto";
import CustomError from "src/error/CustomError";
import PrismaUtil from "src/util/PrismaUtil";

class PhotoService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async addTextWatermark(inputPath: string, outputPath: string, watermarkText: string): Promise<void> {
		try {
			// Read image metadata
			const image = sharp(inputPath);
			let { width, height } = await image.metadata();

			// Fallback dimensions if metadata is missing
			if (!width || !height) {
				const raw = await image.raw().toBuffer({ resolveWithObject: true });
				width = raw.info.width;
				height = raw.info.height;
			}

			// Ensure dimensions
			width = width || 1920;
			height = height || 1080;

			// Dynamically calculate font size (e.g., 18% of the smaller dimension)
			const fontSize = Math.round(Math.min(width, height) * 0.185);

			// Define watermark color and opacity
			const opacity = 0.75; // Lower opacity for blending into the background
			const textColor = `rgba(237, 237, 237, ${opacity})`; // Light watermark text
			const shadowColor = "rgba(0, 0, 0, 0.3)"; // Subtle shadow for contrast

			// Generate SVG for the watermark
			const svgText = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="${shadowColor}" />
            </filter>
          </defs>
          <style>
            .watermark {
              fill: ${textColor};
              font-size: ${fontSize}px;
              font-family: Arial, sans-serif;
              font-weight: bold;
              text-anchor: middle;
              alignment-baseline: middle;
              filter: url(#shadow); /* Add subtle shadow for better visibility */
            }
          </style>
          <text
            x="50%"
            y="50%"
            class="watermark"
            transform="rotate(-45 ${width / 2} ${height / 2})"
          >
            ${watermarkText}
          </text>
        </svg>
      `;

			// Convert SVG to buffer
			const svgBuffer = Buffer.from(svgText);

			// Overlay the watermark on the image
			await image.composite([{ input: svgBuffer, top: 0, left: 0 }]).toFile(outputPath);
		} catch (error: any) {
			CustomError.builder().setMessage("cannot watermark photo").setDetailedMessage(error.message).setErrorType("Watermark Error").setStatusCode(500).build().throwError();
		}
	}

	public async uploadPhotoDb(user: UserDto, fileName: string): Promise<BaseResponseDto> {
		try {
			// todo user id
			// todo location id
			// todo category id
			// todo device info
			const instance = await this.prisma.photo.create({
				data: {
					file_path: fileName,
					user_id: user.id,
					auction_id: null,
					location_id: 1,
					category_id: 1,
					title: fileName,
					device_info: "deviceInfo",
					vote_count: 0,
					is_deleted: false,
					created_at: new Date(),
					updated_at: new Date(),
					status_id: 1,
  					is_auctionable: false,
				},
			});

			return { id: Number(instance.id) };
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async listPhotos(): Promise<ReadAllPhotoResponseDto[]> {
		try {
			const instanceList = await this.prisma.photo.findMany({
				where: {
					is_deleted: false,
				},
			});

			const mappedInstanceList: ReadAllPhotoResponseDto[] = instanceList.map((photo) => ({
				id: Number(photo.id),
				file_path: photo.file_path,
				title: photo.title,
				device_info: photo.device_info,
				vote_count: photo.vote_count,
				user_id: Number(photo.user_id),
				auction_id: photo.auction_id ? Number(photo.auction_id) : null,
				location_id: Number(photo.location_id),
				category_id: Number(photo.category_id),
				status_id: photo.status_id,
				created_at: photo.created_at,
				updated_at: photo.updated_at,
			}));

			return mappedInstanceList;
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getPhotoPath(photoId: number): Promise<string> {
		try {
			const instance = await this.prisma.photo.findUnique({
				where: {
					id: photoId,
					is_deleted: false,
				},
				select: {
					file_path: true,
				},
			});

			const resolvedPath = path.resolve(WATERMARK_PHOTO_DIR, instance.file_path);
			if (!fs.existsSync(resolvedPath)) throw new Error();
			return resolvedPath;
		} catch (error: any) {
			CustomError.builder().setMessage("Error reading photo file").setDetailedMessage(error.message).setErrorType("Server Error").setStatusCode(500).build().throwError();
		}
	}
}

export default PhotoService;
