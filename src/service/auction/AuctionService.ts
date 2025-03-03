import { PrismaClient } from "@prisma/client";
import CustomError from "src/error/CustomError";
import DateUtil from "src/util/dateUtil";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class AuctionService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewAuction(category: any): Promise<any> {
		console.log("category");
		console.log(JSON.stringify(category, null, 2));
		try {
			// todo insert status dynamically with name not id
			// todo set finish time according to cron database data.
			const newAuctionTemp = await this.prisma.auction.create({
				data: {
					category_id: category.id,
					status_id: 5,
					start_time: DateUtil.getNowWithoutMs(),
					finish_time: new Date(),
					is_deleted: false,
					created_at: DateUtil.getNowWithoutMs(),
					updated_at: DateUtil.getNowWithoutMs(),
				},
			});

			console.log("New auction inserted: ", JSON.stringify(handlePrismaType(newAuctionTemp), null, 2));

			return handlePrismaType(newAuctionTemp);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	// public async listAllAuctions(): Promise<any[]> {
	// 	try {
	// 		const instanceList = await this.prisma.auction.findMany({
	// 			where: { is_deleted: false },
	// 			include: {
	// 				category: true,
	// 				status: true,
	// 				bid_list: true,
	// 				photo_list: true,
	// 			},
	// 		});
	//         // console.log("instanceList");
	//         // console.log(instanceList);

	//         // {
	//         //     id: 1n,
	//         //     category_id: 1n,
	//         //     status_id: 1,
	//         //     start_time: 2025-03-02T20:01:59.877Z,
	//         //     finish_time: 2025-03-02T20:01:59.877Z,
	//         //     is_deleted: false,
	//         //     created_at: 2025-03-02T20:01:59.877Z,
	//         //     updated_at: 2025-03-02T20:01:59.877Z,
	//         //     category: {
	//         //       id: 1n,
	//         //       name: 'Düden Şelalesi',
	//         //       status_id: 2,
	//         //       address: 'Turkey, Antalya, Düden Park',
	//         //       location_id: 1n,
	//         //       valid_radius: 10,
	//         //       is_deleted: false,
	//         //       created_at: 2025-01-16T10:00:00.000Z,
	//         //       updated_at: 2025-01-16T10:00:00.000Z
	//         //     },
	//         //     status: { id: 1, status: 'wait' },
	//         //     bid_list: [],
	//         //     photo_list: []
	//         //   }

	//         return null;

	// 		// return auctionList.map(handleBigint);
	// 	} catch (error: any) {
	// 		CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
	// 	}
	// }
}

export default AuctionService;
