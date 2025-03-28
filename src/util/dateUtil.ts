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
}

export default DateUtil;
