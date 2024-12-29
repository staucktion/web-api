import EnvVariables from "src/env/envVariables";

class Config {
	static port = EnvVariables.port;
	static mode = EnvVariables.mode;
	static log = EnvVariables.log;
	static multerFileSize = EnvVariables.multerFileSize;

	static watermark = { ...EnvVariables.watermark };
}

export default Config;
