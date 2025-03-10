import { PrismaClient } from "@prisma/client";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class PhotographerPaymentService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewPhotographerPayment(data: any): Promise<any> {
		try {
			const newInstance = await this.prisma.photographer_payment.create({ data });
			return handlePrismaType(newInstance);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default PhotographerPaymentService;
