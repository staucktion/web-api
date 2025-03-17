import { PrismaClient } from "@prisma/client";
import PurchasedPhotoDto from "src/dto/photo/PurchasedPhotoDto";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class PurchasedPhotoService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewPurchasedPhoto(data: any): Promise<any> {
		try {
			const newInstance = await this.prisma.purchased_photo.create({ data });
			return handlePrismaType(newInstance);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async listOwnPurchasedPhotoList(userId: number): Promise<PurchasedPhotoDto[]> {
		try {
			const instanceList = await this.prisma.purchased_photo.findMany({
				where: {
					user_id: userId,
				},
			});
			return handlePrismaType(instanceList);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default PurchasedPhotoService;
