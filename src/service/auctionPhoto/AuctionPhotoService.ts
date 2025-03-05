import { PrismaClient } from "@prisma/client";
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
					created_at: DateUtil.getNowWithoutMs(),
					updated_at: DateUtil.getNowWithoutMs(),
				},
			});

			return handlePrismaType(newTempInstance);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default AuctionPhotoService;
