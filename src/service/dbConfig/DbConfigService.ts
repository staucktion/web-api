import { PrismaClient } from "@prisma/client";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import handlePrismaError from "src/util/handlePrismaError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";

class DbConfigService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async fetchDbConfig(): Promise<DbConfigDto> {
		try {
			const dbConfig = await this.prisma.config.findFirst();
			return handlePrismaType(dbConfig);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async setDbConfig(dbConfigDto: Omit<DbConfigDto, "id">): Promise<DbConfigDto> {
		try {
			const updatedConfig = await this.prisma.config.update({
				where: { id: 1 },
				data: {
					voter_comission_percentage: dbConfigDto.voter_comission_percentage,
					photographer_comission_percentage: dbConfigDto.photographer_comission_percentage,
					is_timer_job_active: dbConfigDto.is_timer_job_active,
				},
			});
			return handlePrismaType(updatedConfig);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default DbConfigService;
