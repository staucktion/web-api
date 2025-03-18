import { PrismaClient } from "@prisma/client";
import handlePrismaType from "src/util/handlePrismaType";
import handlePrismaError from "src/util/handlePrismaError";
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
		} catch (error) {
			handlePrismaError(error);
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
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async updateVote(id, data: any): Promise<any> {
		try {
			const { _auction, _photo, _status, _user, ...cleanData } = data;

			const updatedInstance = await this.prisma.vote.update({
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

export default VoteService;
