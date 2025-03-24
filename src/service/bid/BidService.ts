import { PrismaClient } from "@prisma/client";
import BidResponseDto from "src/dto/bid/BidResponseDto";
import DateUtil from "src/util/dateUtil";
import handlePrismaError from "src/util/handlePrismaError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class BidService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewBid(data: any): Promise<any> {
		try {
			const newInstanceTemp = await this.prisma.bid.create({ data: { ...data, created_at: DateUtil.getNowWithoutMs() } });
			return handlePrismaType(newInstanceTemp);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async getBidsByAuctionPhotoId(auctionPhotoId: number): Promise<any> {
		try {
			const instanceList = await this.prisma.bid.findMany({
				where: {
					auction_photo_id: auctionPhotoId,
				},
				include: {
					user: true,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async getBidsByAuctionPhotoIdPlain(auctionPhotoId: number): Promise<BidResponseDto> {
		try {
			const instanceList = await this.prisma.bid.findMany({
				where: {
					auction_photo_id: auctionPhotoId,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default BidService;
