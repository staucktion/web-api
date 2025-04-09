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

	public async updateCronList(cronDtoListToUpdate: Partial<CronDto>[]): Promise<CronDto[]> {
		// clean and remove undefined values from update data
		const cleanUpdateData = cronDtoListToUpdate.map((cronDto) => {
			const cleanedCronDto: Partial<CronDto> = {};
			cleanedCronDto.id = cronDto.id;
			if (cronDto.name !== undefined) cleanedCronDto.name = cronDto.name;
			if (cronDto.unit !== undefined) cleanedCronDto.unit = cronDto.unit;
			if (cronDto.interval !== undefined) cleanedCronDto.interval = cronDto.interval;
			if (cronDto.last_trigger_time !== undefined) cleanedCronDto.last_trigger_time = cronDto.last_trigger_time;
			if (cronDto.next_trigger_time !== undefined) cleanedCronDto.next_trigger_time = cronDto.next_trigger_time;
			return cleanedCronDto;
		});

		try {
			const updatedCronJobs = await this.prisma.$transaction(cleanUpdateData.map((data) => this.prisma.cron.update({ where: { id: data.id }, data })));
			return handlePrismaType(updatedCronJobs);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default CronService;
