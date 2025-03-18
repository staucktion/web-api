import { PrismaClient } from "@prisma/client";
import CustomError from "src/error/CustomError";
import DateUtil from "src/util/dateUtil";
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
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
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
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default BidService;
