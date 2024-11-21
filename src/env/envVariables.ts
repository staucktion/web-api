import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  PORT: process.env.PORT || 3000,
  WATERMARK_FONT_SIZE: Number(process.env.WATERMARK_FONT_SIZE || 10),
  WATERMARK_TRANSPARENCY: Number(process.env.WATERMARK_TRANSPARENCY || 0.8),
  WATERMARK_TEXT: process.env.WATERMARK_TEXT || "STAUCKTION",
};

export default envVariables;
