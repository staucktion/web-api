import axios from "axios";
import https from "https";
import Config from "src/config/Config";
import CustomError from "src/error/CustomError";
import { getErrorMessage } from "src/util/getErrorMessage";
import { getResponseErrorMessage } from "src/util/getResponseErrorMessage";

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
				.setDetailedMessage(getErrorMessage(error))
				.setMessage(`Cannot perform bank api operation. ${getResponseErrorMessage(error)}`)
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
				.setDetailedMessage(getErrorMessage(error))
				.setMessage(`Cannot perform bank api operation. ${getResponseErrorMessage(error)}`)
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
				.setDetailedMessage(getErrorMessage(error))
				.setMessage(`Cannot perform bank api operation. ${getResponseErrorMessage(error)}`)
				.build()
				.throwError();
		}
	}
}

export default BankService;
