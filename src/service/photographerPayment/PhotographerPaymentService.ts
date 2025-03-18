import { PrismaClient } from "@prisma/client";
import photographerPaymentResponse from "src/dto/photographerPayment/photographerPaymentResponse";
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
		} catch (error) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getPhotographerPaymentList(userId: number, statusId: number): Promise<photographerPaymentResponse> {
		try {
			const instanceList = await this.prisma.photographer_payment.findMany({
				where: {
					user_id: userId,
					status_id: statusId,
				},
				include: { status: true },
			});
			return handlePrismaType(instanceList);
		} catch (error) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async updatePhotographerPayment(id: number, data: any): Promise<any> {
		try {
			const { _status, _user, ...cleanData } = data;

			const updatedInstance = await this.prisma.photographer_payment.update({
				where: { id },
				data: {
					...cleanData,
				},
			});

			return updatedInstance;
		} catch (error) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default PhotographerPaymentService;
