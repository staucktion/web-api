import cron from "node-cron";
import TimerFacade from "src/facade/timer/TimerFacade";
import TimerService from "src/service/timer/TimerService";

export class Timer {
	private task: cron.ScheduledTask | null = null;
	private timerService: TimerService;
	private timerFacade: TimerFacade;

	constructor() {
		this.timerService = new TimerService();
		this.timerFacade = new TimerFacade();
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

		console.info(`🕑🕑🕑`);
		console.info(`🕑 Timer started with cron expression: ${cronExpression}`);
		console.info(`🕑🕑🕑`);
	}

	public stop() {
		if (this.task) {
			this.task.stop();
			this.task = null;
			console.log("Timer stopped.");
		}
	}

	private async cronJob() {
		await this.timerFacade.cronJob();
	}
}
