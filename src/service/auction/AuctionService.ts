import { PrismaClient } from "@prisma/client";
import Config from "src/config/Config";
import CustomError from "src/error/CustomError";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class AuctionService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewAuction(categoryId: number): Promise<any> {
		// console.log("category");
		// console.log(JSON.stringify(category, null, 2));
		try {
			const voteStatus = await this.prisma.status.findFirst({
				where: { status: "vote" },
			});

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
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default AuctionService;
