import { PrismaClient } from "@prisma/client";
import CronDto from "src/dto/cron/CronDto";
import handlePrismaError from "src/util/handlePrismaError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class CronService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async getCronList(): Promise<CronDto[]> {
		try {
			const instanceList = await this.prisma.cron.findMany({});
			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default CronService;
