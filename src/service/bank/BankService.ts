import axios from "axios";
import https from "https";
import Config from "src/config/Config";
import CustomError from "src/error/CustomError";
import StatusService from "../status/StatusService";
import CardDto from "src/dto/bank/CardDto";

class BankService {
	private statusService: StatusService;

	constructor() {
		this.statusService = new StatusService();
	}

	public async addProvision(data: CardDto): Promise<boolean> {
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
		} catch (error: any) {
			CustomError.builder()
				.setErrorType("Bank Error")
				.setStatusCode(400)
				.setDetailedMessage(error.message)
				.setMessage(`Cannot perform bank api operation. ${error?.response?.data?.message}`)
				.build()
				.throwError();
		}
	}

	public async removeProvision(data: CardDto): Promise<boolean> {
		try {
			const response = await axios.put(`${Config.bankUrl}/provisions/remove`, data, {
				headers: {
					"Content-Type": "application/json",
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			});

			return true;
		} catch (error: any) {
			CustomError.builder()
				.setErrorType("Bank Error")
				.setStatusCode(400)
				.setDetailedMessage(error.message)
				.setMessage(`Cannot perform bank api operation. ${error?.response?.data?.message}`)
				.build()
				.throwError();
		}
	}
}

export default BankService;
