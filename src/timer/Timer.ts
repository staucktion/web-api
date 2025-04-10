import CronDto from "src/dto/cron/CronDto";
import CustomError from "src/error/CustomError";
import TimerFacade from "src/facade/timer/TimerFacade";
import WebSocketManager from "src/websocket/WebSocketManager";
import CronService from "src/service/cron/CronService";
import DateUtil from "src/util/dateUtil";
import { cronEnum } from "src/types/cronEnum";

export class Timer {
	private cronId: number;
	private timerFacade: TimerFacade;
	private cronService: CronService;
	private timeoutId: NodeJS.Timeout | null = null;

	constructor(webSocketManager: WebSocketManager, cronId: number) {
		this.cronId = cronId;
		this.timerFacade = new TimerFacade(webSocketManager);
		this.cronService = new CronService();
	}

	public async start() {
		if (this.timeoutId) {
			console.log("Timer is already running.");
			return;
		}

		let cronDto: CronDto;
		let timeoutInterval: number;

		// get cron dto
		try {
			cronDto = await this.cronService.getCronById(this.cronId);
		} catch (error) {
			CustomError.handleSystemError(error);
			return;
		}

		// convert corresponding time to ms
		try {
			timeoutInterval = DateUtil.convertToMilliseconds(cronDto.interval, cronDto.unit);
		} catch (error) {
			CustomError.handleSystemError(error);
			return;
		}

		this.scheduleNextRun(timeoutInterval);

		console.info("\n🕑🕑🕑");
		console.info(`🕑 Timer ${cronEnum[this.cronId]} started with schedule: [${cronDto.interval}${cronDto.unit}]`);
		console.info("🕑🕑🕑");
	}

	public stop() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
			console.log("Timer stopped.");
		}
	}

	private scheduleNextRun(interval: number) {
		this.timeoutId = setTimeout(async () => {
			// run job
			try {
				await this.timerFacade.cronJob(this.cronId);
			} catch (error) {
				CustomError.handleSystemError(error);
			}

			this.scheduleNextRun(interval);
		}, interval);
	}
}
