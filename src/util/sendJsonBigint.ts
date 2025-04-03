import { Response } from "express";

/**
 * Converts a JavaScript object with BigInt values to a JSON string
 * @param param Any JavaScript object that might contain BigInt values
 * @returns A JSON string with BigInt values converted to strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonStringifyBigint = (param: any): string => {
	return JSON.stringify(
		param,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
	);
};

/**
 * Sends a JSON response with proper Content-Type header, handling BigInt values
 * @param res Express Response object
 * @param data Any JavaScript object that might contain BigInt values
 * @param status HTTP status code (defaults to 200)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendJsonBigint = (res: Response, data: any, status: number = 200): void => {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.status(status).send(jsonStringifyBigint(data));
};

export default sendJsonBigint;
