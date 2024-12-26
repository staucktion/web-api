import EnvVairables from "src/env/EnvVariables";

class Config {
  static port = EnvVairables.port;

  static mode = EnvVairables.mode;

  static watermark = {
    text: EnvVairables.watermark.text,
    fontSize: EnvVairables.watermark.fontSize,
    transparency: EnvVairables.watermark.transparency,
  };
}

export default Config;
