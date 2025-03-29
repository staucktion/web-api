import { PrismaClient } from "@prisma/client";
import VoteDto from "src/dto/vote/VoteDto";
import handlePrismaError from "src/util/handlePrismaError";
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

	public async getVoteListByUserIdAndStatusId(userId: number, statusId: number): Promise<VoteDto[]> {
		try {
			const instanceList = await this.prisma.vote.findMany({
				where: {
					user_id: userId,
					status_id: statusId,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async updateVote(id, data: any): Promise<any> {
		try {
			const { auction: _auction, photo: _photo, status: _status, user: _user, ...cleanData } = data;

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
