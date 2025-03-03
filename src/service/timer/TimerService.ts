import { PrismaClient } from "@prisma/client";
import CronDto from "src/dto/cron/CronDto";
import CustomError from "src/error/CustomError";
import DateUtil from "src/util/dateUtil";
import PrismaUtil from "src/util/PrismaUtil";

class TimerService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async getCronInformation(): Promise<CronDto> {
		try {
			const instance = await this.prisma.cron.findFirst();

			if (!instance) {
				throw CustomError.builder().setErrorType("Not Found").setStatusCode(404).setMessage("No cron data found.").build();
			}

			const cronDto: CronDto = {
				id: Number(instance.id),
				unit: instance.unit,
				interval: instance.interval,
				lastTriggerTime: instance.last_trigger_time,
			};

			return cronDto;
		} catch (error: any) {
			CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async getCronExpression(): Promise<string> {
		try {
			const cronDto: CronDto = await this.getCronInformation();

			let cronExpression: string;
			switch (cronDto.unit) {
				case "s":
					cronExpression = `*/${cronDto.interval} * * * * *`; // Every X seconds
					break;
				case "m":
					cronExpression = `*/${cronDto.interval} * * * *`; // Every X minutes
					break;
				case "h":
					cronExpression = `0 */${cronDto.interval} * * *`; // Every X hours
					break;
				case "w":
					cronExpression = `0 0 * * ${cronDto.interval}`; // Every X weeks (0-6, where 0 = Sunday)
					break;
				default:
					throw CustomError.builder().setErrorType("Invalid Cron Unit").setStatusCode(400).setMessage(`Invalid unit '${cronDto.unit}'. Expected 's', 'm', or 'h'.`).build();
			}

			return cronExpression;
		} catch (error: any) {
			CustomError.builder().setErrorType("Cron Expression Read Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build().throwError();
		}
	}

	public async saveLastTriggerTimeToDb(): Promise<void> {
		try {
			const currentTime = DateUtil.getNowWithoutMs();

			const updatedCron = await this.prisma.cron.updateMany({
				data: { last_trigger_time: currentTime },
			});

			if (updatedCron.count === 0) {
				throw CustomError.builder().setErrorType("Cron Write Error").setStatusCode(404).setMessage("Cannot update cron last_triggered_time").build();
			}
		} catch (error: any) {
			throw CustomError.builder().setErrorType("Prisma Error").setStatusCode(500).setDetailedMessage(error.message).setMessage("Cannot perform database operation.").build();
		}
	}
}

export default TimerService;
