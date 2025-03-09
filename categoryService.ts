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
			const instanceListTmp = await this.prisma.category.findMany({
				where: { is_deleted: false },
				include: {
					location: true,
					status: true,
					auction_list: { where: { is_deleted: false }, include: { status: true, photo_list: true } },
					photo_list: { where: { is_deleted: false }, include: { status: true } },
				},
			});

			return handlePrismaType(instanceListTmp).map(({ location_id, status_id, ...rest }) => rest);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default CategoryService;
