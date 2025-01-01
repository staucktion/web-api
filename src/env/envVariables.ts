import dotenv from "dotenv";
dotenv.config();

class EnvVariables {
	static port = process.env.PORT || 8082;
	static mode = process.env.MODE || "dev";
	static log = process.env.LOG === "true";
	static multerFileSize = Number(process.env.MULTER_FILE_SIZE || 100000000);

	static watermark = {
		fontSize: Number(process.env.WATERMARK_FONT_SIZE || 10),
		transparency: Number(process.env.WATERMARK_TRANSPARENCY || 0.8),
		text: process.env.WATERMARK_TEXT || "STAUCKTION",
	};

	static email = {
		from: process.env.EMAIL_FROM || "",
		pass: process.env.EMAIL_PASS || "",
		service: process.env.EMAIL_SERVICE || "",
	};
}

export default EnvVariables;
