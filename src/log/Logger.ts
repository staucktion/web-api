import { Request, Response, NextFunction } from "express";

class Logger {
	private static requestCount = 0;

	public static logRequest(req: Request, res: Response, next: NextFunction): void {
		Logger.requestCount++;

		const requestNumber = `#${Logger.requestCount}`.padEnd(4);
		const ip = req.ip.padEnd(15);
		const method = req.method.padEnd(7);
		const url = req.originalUrl;

		console.log(`[Info] Request ${requestNumber} -> ${ip} - ${method} - ${url}`);
		next();
	}

	public static info(message: string): void {
		console.log(`[Info] ${message}`);
	}

	public static error(message: string): void {
		console.error(`[Error] ${message}`);
	}

	public static warn(message: string): void {
		console.warn(`[Warning] ${message}`);
	}
}

export default Logger;
