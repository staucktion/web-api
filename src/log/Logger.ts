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
}

export default Logger;
