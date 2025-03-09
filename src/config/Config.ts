import EnvVariables from "src/env/envVariables";

class Config {
	static port = EnvVariables.port;
	static mode = EnvVariables.mode;
	static isEnvVarLoaded = EnvVariables.mode !== undefined;
	static requestLog = EnvVariables.requestLog;
	static explicitErrorLog = EnvVariables.explicitErrorLog;
	static multerFileSize = EnvVariables.multerFileSize;
	static bankUrl = EnvVariables.bankUrl;
	static provisionAmount  = EnvVariables.provisionAmount;

	static watermark = { ...EnvVariables.watermark };

	static email = { ...EnvVariables.email };

	static appUrl = EnvVariables.appUrl;

	static jwt = { ...EnvVariables.jwt };

	static googleOAuth = { ...EnvVariables.googleOAuth };

	static cronInterval = null;
}

export default Config;
