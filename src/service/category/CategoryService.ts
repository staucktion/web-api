import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import CategoryDto from "src/dto/category/CategoryDto";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class CategoryService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async listAllCategories(): Promise<CategoryDto[]> {
		try {
			const instanceList = await this.prisma.category.findMany({
				where: { is_deleted: false },
				include: {
					location: true,
					status: true,
					auction_list: true,
					photo_list: true,
				},
			});

			const mappedInstanceList: CategoryDto[] = instanceList.map((instance) => {
				const tmpInstance = handlePrismaType(instance);

				return {
					id: tmpInstance.id,
					name: tmpInstance.name,
					address: tmpInstance.address,
					valid_radius: tmpInstance.valid_radius,
					location: tmpInstance.location,
					status: tmpInstance.status.status,
					auction_list: tmpInstance.auction_list,
					photo_list: tmpInstance.photo_list,
				};
			});

			return mappedInstanceList;
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default CategoryService;
