import axios from "axios";
import https from "https";
import Config from "src/config/Config";
import CustomError from "src/error/CustomError";
import { hasKey } from "src/util/tsUtil";

class BankService {
	constructor() {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async addProvision(data: any): Promise<boolean> {
		try {
			await axios.put(`${Config.bankUrl}/provisions/add`, data, {
				headers: {
					"Content-Type": "application/json",
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			});

			return true;
		} catch (error) {
			CustomError.builder()
				.setErrorType("Bank Error")
				.setStatusCode(400)
				.setDetailedMessage(hasKey(error, "message") && typeof error.message === "string" ? error.message : "Unknown error")
				.setMessage(
					`Cannot perform bank api operation. ${
						hasKey(error, "response") && hasKey(error.response, "data") && hasKey(error.response.data, "message") && typeof error.response.data.message === "string"
							? error.response.data.message
							: "Unknown error"
					}`
				)
				.build()
				.throwError();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async removeProvision(data: any): Promise<boolean> {
		try {
			await axios.put(`${Config.bankUrl}/provisions/remove`, data, {
				headers: {
					"Content-Type": "application/json",
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			});

			return true;
		} catch (error) {
			CustomError.builder()
				.setErrorType("Bank Error")
				.setStatusCode(400)
				.setDetailedMessage(hasKey(error, "message") && typeof error.message === "string" ? error.message : "Unknown error")
				.setMessage(
					`Cannot perform bank api operation. ${
						hasKey(error, "response") && hasKey(error.response, "data") && hasKey(error.response.data, "message") && typeof error.response.data.message === "string"
							? error.response.data.message
							: "Unknown error"
					}`
				)
				.build()
				.throwError();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async transfer(data: any): Promise<boolean> {
		try {
			await axios.post(`${Config.bankUrl}/transactions`, data, {
				headers: {
					"Content-Type": "application/json",
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			});

			return true;
		} catch (error) {
			CustomError.builder()
				.setErrorType("Bank Error")
				.setStatusCode(400)
				.setDetailedMessage(hasKey(error, "message") && typeof error.message === "string" ? error.message : "Unknown error")
				.setMessage(
					`Cannot perform bank api operation. ${
						hasKey(error, "response") && hasKey(error.response, "data") && hasKey(error.response.data, "message") && typeof error.response.data.message === "string"
							? error.response.data.message
							: "Unknown error"
					}`
				)
				.build()
				.throwError();
		}
	}
}

export default BankService;
