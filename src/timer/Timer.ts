import cron from "node-cron";

export class Timer {
  private static task: cron.ScheduledTask | null = null;
  private static readonly cronExpression: string = "*/5 * * * * *";

  static start() {
    if (this.task) {
      console.log("Timer is already running.");
      return;
    }
    this.task = cron.schedule(this.cronExpression, () => this.cronJob(), {
      scheduled: true,
      timezone: "UTC",
    });

    console.log(`Timer started with cron expression: ${this.cronExpression}`);
  }

  static stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("Timer stopped.");
    }
  }

  private static cronJob() {
    console.log("Job is running at:", new Date().toISOString());
  }
}
