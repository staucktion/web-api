import { PrismaClient } from "@prisma/client";
import StatusDto from "src/dto/status/StatusDto";
import handlePrismaError from "src/util/handlePrismaError";
import PrismaUtil from "src/util/PrismaUtil";

class StatusService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async getStatusFromName(name: string): Promise<StatusDto> {
		try {
			return await this.prisma.status.findFirst({ where: { status: name } });
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default StatusService;
