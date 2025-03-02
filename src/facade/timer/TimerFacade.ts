import TimerService from "src/service/timer/TimerService";

class TimerFacade {
	private timerService: TimerService;

	constructor() {
		this.timerService = new TimerService();
	}
	public async cronJob() {
		console.log("[INFO] 🕑 Job is running at:", new Date().toISOString());
		this.timerService.saveLastTriggerTimeToDb();
	}
}

export default TimerFacade;
