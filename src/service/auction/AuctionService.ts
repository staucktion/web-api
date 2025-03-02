import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import CategoryDto from "src/dto/category/CategoryDto";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class AuctionService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async listAllAuctions(): Promise<any[]> {
		try {
			const instanceList = await this.prisma.auction.findMany({
				where: { is_deleted: false },
				include: {
					category: true,
					status: true,
					bid_list: true,
					photo_list: true,
				},
			});
            // console.log("instanceList");
            // console.log(instanceList);

            // {
            //     id: 1n,
            //     category_id: 1n,
            //     status_id: 1,
            //     start_time: 2025-03-02T20:01:59.877Z,
            //     finish_time: 2025-03-02T20:01:59.877Z,
            //     is_deleted: false,
            //     created_at: 2025-03-02T20:01:59.877Z,
            //     updated_at: 2025-03-02T20:01:59.877Z,
            //     category: {
            //       id: 1n,
            //       name: 'Düden Şelalesi',
            //       status_id: 2,
            //       address: 'Turkey, Antalya, Düden Park',
            //       location_id: 1n,
            //       valid_radius: 10,
            //       is_deleted: false,
            //       created_at: 2025-01-16T10:00:00.000Z,
            //       updated_at: 2025-01-16T10:00:00.000Z
            //     },
            //     status: { id: 1, status: 'wait' },
            //     bid_list: [],
            //     photo_list: []
            //   }
            
            return null;

			// return auctionList.map(handleBigint);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default AuctionService;
