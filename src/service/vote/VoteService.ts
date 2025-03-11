import { PrismaClient } from "@prisma/client";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class VoteService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async insertNewVote(data: any): Promise<any> {
		try {
			const newInstanceTemp = await this.prisma.vote.create({ data });
			return handlePrismaType(newInstanceTemp);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getVoteListByUserId(userId: number): Promise<any> {
		try {
			const instanceList = await this.prisma.vote.findMany({
				where: {
					user_id: userId,
				},
				include: {
					status: true,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async updateVote(id, data: any): Promise<any> {
		try {
			const { auction, photo, status, user, ...cleanData } = data;

			const updatedInstance = await this.prisma.vote.update({
				where: { id },
				data: {
					...cleanData,
				},
			});

			return updatedInstance;
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default VoteService;
