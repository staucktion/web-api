import EnvVariables from "src/env/EnvVariables";

class Config {
  static port = EnvVariables.port;
  static mode = EnvVariables.mode;
  static log = EnvVariables.log;

  static watermark = { ...EnvVariables.watermark };
}

export default Config;
