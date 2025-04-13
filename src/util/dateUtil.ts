import CustomError from "src/error/CustomError";

class DateUtil {
	public static format(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

		return `${year}-${month}-${day}-${hours}-${minutes}-${milliseconds}`;
	}

	public static getNowWithoutMs(): Date {
		return new Date(new Date().toISOString().replace(/\.\d{3}Z$/, "Z"));
	}

	public static stripMilliseconds(date: Date): Date {
		const noMs = new Date(date);
		noMs.setMilliseconds(0);
		return noMs;
	}

	public static convertToMilliseconds(interval: number, unit: string): number {
		switch (unit) {
			case "s":
				return interval * 1000;
			case "m":
				return interval * 60 * 1000;
			case "h":
				return interval * 60 * 60 * 1000;
			case "d":
				return interval * 24 * 60 * 60 * 1000;
			case "w":
				return interval * 7 * 24 * 60 * 60 * 1000;
			default:
				CustomError.builder().setMessage(`Invalid unit: ${unit}`).setErrorType("Unit error").setStatusCode(500).build().throwError();
		}
	}
}

export default DateUtil;
