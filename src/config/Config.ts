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

	static watermark = { ...EnvVariables.watermark };

	static email = { ...EnvVariables.email };

	static onesignal = { ...EnvVariables.onesignal };

	static appUrl = EnvVariables.appUrl;

	static jwt = { ...EnvVariables.jwt };

	static googleOAuth = { ...EnvVariables.googleOAuth };

	static cronInterval = null;

	static staucktionBankCredentials: CardDto = {
		cardNumber: "3056930009020004",
		expirationDate: "06/29",
		cvv: "876",
	};

	// db configs
	static voterComissionPercentage: number;
	static photographerComissionPercentage: number;
	static photosToAuctionPercentage: number;
	static isTimerActive: boolean;
}

export default Config;
