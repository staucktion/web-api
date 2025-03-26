import CardDto from "src/dto/bank/CardDto";
import EnvVariables from "src/env/envVariables";

class Config {
	static port = EnvVariables.port;
	static mode = EnvVariables.mode;
	static isEnvVarLoaded = EnvVariables.mode !== undefined;
	static requestLog = EnvVariables.requestLog;
	static explicitErrorLog = EnvVariables.explicitErrorLog;
	static multerFileSize = EnvVariables.multerFileSize;
	static bankUrl = EnvVariables.bankUrl;
	static provisionAmount = EnvVariables.provisionAmount;
	static initialAuctionPrice = EnvVariables.initialAuctionPrice;
	static isTimerActive = EnvVariables.isTimerActive;

	static watermark = { ...EnvVariables.watermark };

	static email = { ...EnvVariables.email };

	static appUrl = EnvVariables.appUrl;

	static jwt = { ...EnvVariables.jwt };

	static googleOAuth = { ...EnvVariables.googleOAuth };

	static cronInterval = null;

	static staucktionBankCredentials: CardDto = {
		cardNumber: "1234567890123456",
		expirationDate: "12/34",
		cvv: "123",
	};
}

export default Config;
