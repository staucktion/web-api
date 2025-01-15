import { Request, Response, NextFunction } from "express";

class Logger {
	private static requestCount = 0;

	public static logRequest(req: Request, res: Response, next: NextFunction): void {
		Logger.requestCount++;
		console.log(`[Info] Request #${Logger.requestCount} -> ${req.ip} - ${req.method} - ${req.originalUrl}`);
		next();
	}
}

export default Logger;
