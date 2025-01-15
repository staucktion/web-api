import EnvVariables from "src/env/envVariables";

class Config {
	static port = EnvVariables.port;
	static mode = EnvVariables.mode;
	static requestLog = EnvVariables.requestLog;
	static multerFileSize = EnvVariables.multerFileSize;

	static watermark = { ...EnvVariables.watermark };

	static email = { ...EnvVariables.email };
}

export default Config;
