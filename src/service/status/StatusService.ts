import { PrismaClient } from "@prisma/client";
import StatusDto from "src/dto/status/StatusDto";
import CustomError from "src/error/CustomError";
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
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}
}

export default StatusService;
