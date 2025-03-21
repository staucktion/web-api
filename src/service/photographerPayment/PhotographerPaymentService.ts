import { PrismaClient } from "@prisma/client";
import photographerPaymentResponse from "src/dto/photographerPayment/photographerPaymentResponse";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaError from "src/util/handlePrismaError";

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
			handlePrismaError(error);
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
			handlePrismaError(error);
		}
	}

	public async updatePhotographerPayment(id: number, data: any): Promise<any> {
		try {
			const { status: _status, user: _user, ...cleanData } = data;

			const updatedInstance = await this.prisma.photographer_payment.update({
				where: { id },
				data: {
					...cleanData,
				},
			});

			return updatedInstance;
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default PhotographerPaymentService;
