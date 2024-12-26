import dotenv from "dotenv";
dotenv.config();

class EnvVairables {
  static port = process.env.PORT || 8082;

  static mode = process.env.MODE || "dev";

  static watermark = {
    fontSize: Number(process.env.WATERMARK_FONT_SIZE || 10),
    transparency: Number(process.env.WATERMARK_TRANSPARENCY || 0.8),
    text: process.env.WATERMARK_TEXT || "STAUCKTION",
  };
}

export default EnvVairables;
