import { PrismaClient } from "@prisma/client";
import Config from "src/config/Config";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaError from "src/util/handlePrismaError";
import AuctionPhotoDto from "src/dto/auctionPhoto/AuctionPhotoDto";

class AuctionPhotoService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async getAuctionPhotoListByStatus(statusId: number): Promise<AuctionPhotoDto> {
		try {
			const auctionPhoto = await this.prisma.auction_photo.findMany({ where: { status_id: statusId } });
			return handlePrismaType(auctionPhoto);
		} catch (error) {
			handlePrismaError(error);
		}
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
		} catch (error) {
			handlePrismaError(error);
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
		} catch (error) {
			handlePrismaError(error);
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
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async updateAuctionPhoto(id: number, updateData: any): Promise<any> {
		try {
			const { photo_id, auction_id, status_id, winner_user_id_1, winner_user_id_2, winner_user_id_3, bid_list: _bid_list, ...cleanData } = updateData;

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
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default AuctionPhotoService;
