import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path from "path";
import sharp from "sharp";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import BaseResponseDto from "src/dto/base/BaseResponseDto";
import ReadAllPhotoResponseDto from "src/dto/photo/ReadAllPhotoResponseDto";
import CustomError from "src/error/CustomError";
import StatusService from "src/service/status/StatusService";
import { StatusEnum } from "src/types/statusEnum";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaError from "src/util/handlePrismaError";
import { getErrorMessage } from "src/util/getErrorMessage";

class PhotoService {
	private prisma: PrismaClient;
	private statusService: StatusService;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
		this.statusService = new StatusService();
	}

	public async addTextWatermark(inputPath: string, outputPath: string, watermarkText: string): Promise<void> {
		try {
			// Read image metadata
			const image = sharp(inputPath);
			const metadata = await image.metadata();
			let { width, height } = metadata;
			const { orientation } = metadata;

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

			let svgWidth = width;
			let svgHeight = height;

			// If image is rotated to portrait
			if (orientation && [5, 6, 7, 8].includes(orientation)) {
				svgWidth = height;
				svgHeight = width;
			}

			// Generate SVG for the watermark
			const svgText = `
				<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
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
						transform="rotate(-45 ${svgWidth / 2} ${svgHeight / 2})"
					>
						${watermarkText}
					</text>
				</svg>
      `;

			// Convert SVG to buffer
			const svgBuffer = Buffer.from(svgText);

			// Overlay the watermark on the image
			await image
				.rotate()
				.composite([{ input: svgBuffer, top: 0, left: 0 }])
				.toFile(outputPath);
		} catch (error) {
			CustomError.builder().setMessage("Could not watermark photo").setDetailedMessage(getErrorMessage(error)).setErrorType("Watermark Error").setStatusCode(500).build().throwError();
		}
	}

	public async uploadPhotoDb(
		fileName: string,
		userId: bigint | number,
		locationId: bigint | number,
		categoryId: bigint | number,
		deviceInfo: string,
		statusId: number = StatusEnum.WAIT
	): Promise<BaseResponseDto> {
		try {
			const instance = await this.prisma.photo.create({
				data: {
					file_path: fileName,
					user_id: userId,
					auction_id: null,
					location_id: locationId,
					category_id: categoryId,
					title: fileName,
					device_info: deviceInfo,
					vote_count: 0,
					is_deleted: false,
					created_at: new Date(),
					updated_at: new Date(),
					is_auctionable: false,
					status_id: statusId,
				},
			});

			return { id: Number(instance.id) };
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async getPhotoById(photoId: number): Promise<any> {
		try {
			const instance = await this.prisma.photo.findUnique({
				where: {
					id: photoId,
				},
				include: {
					auction_photo_list: true,
					auction: true,
					category: true,
					location: true,
					status: true,
					user: true,
					vote_list: true,
				},
			});

			return handlePrismaType(instance);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async listPhotosByStatusAndUserId(statusId: number | number[], userId: number | null): Promise<ReadAllPhotoResponseDto[]> {
		try {
			const photoList = await this.prisma.photo.findMany({
				where: {
					is_deleted: false,
					status_id: { in: Array.isArray(statusId) ? statusId : [statusId] },
					user_id: userId ?? undefined,
				},
				include: {
					category: {
						include: {
							location: true,
						},
					},
					status: true,
					user: true,
				},
			});

			return photoList.map((photo) => ({
				id: Number(photo.id),
				file_path: photo.file_path,
				title: photo.title,
				device_info: photo.device_info,
				vote_count: Number(photo.vote_count),
				user_id: Number(photo.user_id),
				auction_id: photo.auction_id ? Number(photo.auction_id) : null,
				location_id: Number(photo.location_id),
				category_id: Number(photo.category_id),
				is_auctionable: photo.is_auctionable,
				status_id: Number(photo.status_id),
				purchase_now_price: photo.purchase_now_price ? Number(photo.purchase_now_price) : null,
				purchased_at: photo.purchased_at ? new Date(photo.purchased_at) : null,
				created_at: photo.created_at,
				updated_at: photo.updated_at,
				category: photo.category,
				status: photo.status,
				user: photo.user,
			}));
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async updatePhotoStatus(photoId: number, newStatus: StatusEnum, _reason?: string): Promise<any> {
		try {
			// First check if the photo exists
			const photo = await this.prisma.photo.findUnique({
				where: { id: photoId },
			});

			if (!photo) {
				CustomError.builder().setMessage("Photo not found").setErrorType("Not Found").setStatusCode(404).build().throwError();
			}

			// Update the photo status
			const updatedPhoto = await this.prisma.photo.update({
				where: { id: photoId },
				data: {
					status_id: newStatus,
					updated_at: new Date(),
					// Note: We'll be storing the reason in a future update
				},
			});

			// Return the updated photo without mapping
			return {
				...updatedPhoto,
				id: Number(updatedPhoto.id),
				vote_count: Number(updatedPhoto.vote_count),
				status_id: Number(updatedPhoto.status_id),
			};
		} catch (error) {
			if (error instanceof CustomError) throw error;
			handlePrismaError(error);
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
		} catch (error) {
			CustomError.builder().setMessage("Error reading photo file").setDetailedMessage(getErrorMessage(error)).setErrorType("Server Error").setStatusCode(500).build().throwError();
		}
	}

	public async deletePhoto(photoId: number): Promise<void> {
		try {
			// check if photo exists
			const photo = await this.prisma.photo.findUnique({
				where: { id: photoId, is_deleted: false },
			});

			if (!photo) {
				CustomError.builder().setMessage("Photo not found").setErrorType("Not Found").setStatusCode(404).build().throwError();
			}
		} catch (error) {
			CustomError.builder().setMessage("Photo not found").setDetailedMessage(getErrorMessage(error)).setErrorType("Server Error").setStatusCode(404).build().throwError();
		}

		try {
			await this.prisma.photo.update({
				where: { id: photoId },
				data: {
					is_deleted: true,
					updated_at: new Date(),
				},
			});
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async updatePhoto(id: number, updateInstanceData: any): Promise<ReadAllPhotoResponseDto[]> {
		try {
			const { user_id, auction_id, category_id, location_id, status_id, auction_photo_list: _auction_photo_list, vote_list: _vote_list, ...cleanData } = updateInstanceData;

			const updatedInstance = await this.prisma.photo.update({
				where: { id },
				data: {
					...cleanData,
					updated_at: DateUtil.getNowWithoutMs(),
					user: { connect: { id: user_id } },
					status: { connect: { id: status_id } },
					auction: auction_id ? { connect: { id: auction_id } } : undefined,
					category: { connect: { id: category_id } },
					location: { connect: { id: location_id } },
				},
			});

			return handlePrismaType(updatedInstance);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async updatePhotoPurchaseNowPrice(photoId: number, price: number | null): Promise<void> {
		try {
			const newStatus = price === null ? "approve" : "purchasable";
			const status = await this.statusService.getStatusFromName(newStatus);

			await this.prisma.photo.update({
				where: { id: photoId, is_deleted: false, status: { status: { in: ["approve", "purchasable"] } } },
				data: { purchase_now_price: price, updated_at: DateUtil.getNowWithoutMs(), status: { connect: { id: status.id } } },
			});
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async updatePhotoAuctionableStatus(photoId: number, auctionable: boolean): Promise<void> {
		try {
			await this.prisma.photo.update({
				where: { id: photoId, is_deleted: false },
				data: { is_auctionable: auctionable, updated_at: DateUtil.getNowWithoutMs(), status: { connect: { id: auctionable ? StatusEnum.APPROVE : StatusEnum.PURCHASABLE } } },
			});
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default PhotoService;
