import cron from "node-cron";
import TimerFacade from "src/facade/timer/TimerFacade";
import TimerService from "src/service/timer/TimerService";
import WebSocketManager from "src/websocket/WebSocketManager";

export class Timer {
	private task: cron.ScheduledTask | null = null;
	private timerService: TimerService;
	private timerFacade: TimerFacade;

	constructor(webSocketManager: WebSocketManager) {
		this.timerService = new TimerService();
		this.timerFacade = new TimerFacade(webSocketManager);
	}

	public async start() {
		if (this.task) {
			console.log("Timer is already running.");
			return;
		}

		const cronExpression = await this.timerService.getCronExpression();

		this.task = cron.schedule(cronExpression, () => this.cronJob(), {
			scheduled: true,
			timezone: "UTC",
		});

		console.info("🕑🕑🕑");
		console.info(`🕑 Timer started with cron expression: ${cronExpression}`);
		console.info("🕑🕑🕑");

		const didCronRun = await this.timerService.didCronRun();
		if (didCronRun) {
			console.info("🕑🕑🕑");
			console.info("🕑 Cron job did not previously run in the defined interval.");
			console.info("🕑 Running it now...");
			console.info("🕑🕑🕑");
			await this.cronJob();
		}
	}

	public stop() {
		if (this.task) {
			this.task.stop();
			this.task = null;
			console.log("Timer stopped.");
		}
	}

	private async cronJob() {
		try {
			await this.timerFacade.cronJob();
		} catch (error) {
			console.error("Cron Error");
			console.error(error);
		}
	}
}
