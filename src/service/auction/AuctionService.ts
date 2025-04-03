import { PrismaClient } from "@prisma/client";
import Config from "src/config/Config";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";
import StatusService from "../status/StatusService";
import handlePrismaError from "src/util/handlePrismaError";

class AuctionService {
	private prisma: PrismaClient;
	private statusService: StatusService;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
		this.statusService = new StatusService();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async getAuctionById(auctionId: number): Promise<any> {
		try {
			const auction = await this.prisma.auction.findUnique({
				where: {
					id: auctionId,
					is_deleted: false,
				},
				include: {
					category: true,
					status: true,
					auction_photo_list: true,
					photo_list: true,
				},
			});

			return handlePrismaType(auction);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async getAuctionList(): Promise<any> {
		try {
			const instanceTemp = await this.prisma.auction.findMany({
				where: {
					is_deleted: false,
				},
				include: {
					category: true,
					status: true,
					auction_photo_list: true,
					photo_list: true,
				},
			});

			return handlePrismaType(instanceTemp);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async insertNewAuction(categoryId: number): Promise<any> {
		try {
			const voteStatus = await this.statusService.getStatusFromName("vote");
			const newAuctionTemp = await this.prisma.auction.create({
				data: {
					category_id: categoryId,
					status_id: voteStatus.id,
					start_time: DateUtil.getNowWithoutMs(),
					finish_time: new Date(DateUtil.getNowWithoutMs().getTime() + Config.cronInterval),
					is_deleted: false,
					created_at: DateUtil.getNowWithoutMs(),
					updated_at: DateUtil.getNowWithoutMs(),
				},
			});

			return handlePrismaType(newAuctionTemp);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async updateAuction(auctionId: number, updateAuctionData: any): Promise<any> {
		try {
			const { category_id, status_id, id: _id, photo_list: _photo_list, ...cleanData } = updateAuctionData;

			const updatedAuction = await this.prisma.auction.update({
				where: { id: auctionId },
				data: {
					...cleanData,
					updated_at: DateUtil.getNowWithoutMs(),
					status: {
						connect: { id: status_id },
					},
					category: {
						connect: { id: category_id },
					},
				},
			});

			return handlePrismaType(updatedAuction);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default AuctionService;
