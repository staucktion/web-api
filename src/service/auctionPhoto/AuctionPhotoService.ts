import { PrismaClient } from "@prisma/client";
import Config from "src/config/Config";
import CustomError from "src/error/CustomError";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class AuctionPhotoService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewPhotoAuction(auctionId: number, photoId: number, statusId): Promise<any> {
		try {
			const newTempInstance = await this.prisma.auction_photo.create({
				data: {
					auction_id: auctionId,
					photo_id: photoId,
					status_id: statusId,
					last_bid_amount: Config.initialAuctionPrice,
					start_time: DateUtil.getNowWithoutMs(),
					finish_time: new Date(DateUtil.getNowWithoutMs().getTime() + Config.cronInterval),
					created_at: DateUtil.getNowWithoutMs(),
					updated_at: DateUtil.getNowWithoutMs(),
				},
			});

			return handlePrismaType(newTempInstance);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getAuctionPhotoByPhotoId(photoId: number): Promise<any> {
		try {
			const auctionPhoto = await this.prisma.auction_photo.findFirst({
				where: { photo_id: photoId },
				include: {
					auction: true,
					photo: true,
					status: true,
					winner_user_1: true,
					winner_user_2: true,
					winner_user_3: true,
					bid_list: true,
				},
			});

			return handlePrismaType(auctionPhoto);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getAuctionPhotoByAuctionId(auctionId: number): Promise<any> {
		try {
			const auctionPhoto = await this.prisma.auction_photo.findFirst({
				where: { auction_id: auctionId },
				include: {
					auction: true,
					photo: true,
					status: true,
					winner_user_1: true,
					winner_user_2: true,
					winner_user_3: true,
					bid_list: true,
				},
			});

			return handlePrismaType(auctionPhoto);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async updateAuctionPhoto(id: number, updateData: any): Promise<any> {
		try {
			const { photo_id, auction_id, status_id, winner_user_id_1, winner_user_id_2, winner_user_id_3, bid_list, ...cleanData } = updateData;

			const updatedInstance = await this.prisma.auction_photo.update({
				where: { id },
				data: {
					...cleanData,
					updated_at: DateUtil.getNowWithoutMs(),
					auction: {
						connect: { id: auction_id },
					},
					photo: {
						connect: { id: photo_id },
					},
					status: {
						connect: { id: status_id },
					},
					winner_user_1: winner_user_id_1 ? { connect: { id: Number(winner_user_id_1) } } : undefined,
					winner_user_2: winner_user_id_2 ? { connect: { id: Number(winner_user_id_2) } } : undefined,
					winner_user_3: winner_user_id_3 ? { connect: { id: Number(winner_user_id_3) } } : undefined,
				},
			});

			return handlePrismaType(updatedInstance);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default AuctionPhotoService;
