import { PrismaClient } from "@prisma/client";
import PurchasedPhotoDto from "src/dto/photo/PurchasedPhotoDto";
import handlePrismaError from "src/util/handlePrismaError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class PurchasedPhotoService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async insertNewPurchasedPhoto(data: any): Promise<any> {
		try {
			const newInstance = await this.prisma.purchased_photo.create({ data });
			return handlePrismaType(newInstance);
		} catch (error) {
			handlePrismaError(error);
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
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default PurchasedPhotoService;
