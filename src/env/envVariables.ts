import dotenv from "dotenv";
dotenv.config();

class EnvVariables {
	static port: number = parseInt(process.env.PORT);
	static mode: string = process.env.MODE;
	static requestLog: boolean = Boolean(process.env.REQUEST_LOG);
	static explicitErrorLog: boolean = Boolean(process.env.REQUEST_LOG);
	static multerFileSize = parseInt(process.env.MULTER_FILE_SIZE);

	static watermark = {
		fontSize: parseFloat(process.env.WATERMARK_FONT_SIZE),
		transparency: parseFloat(process.env.WATERMARK_TRANSPARENCY),
		text: process.env.WATERMARK_TEXT,
	};

	static email = {
		from: process.env.EMAIL_FROM,
		pass: process.env.EMAIL_PASS,
		service: process.env.EMAIL_SERVICE,
	};

	static appUrl = process.env.VITE_APP_URL;

	static jwt = {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN as `${number}${"s" | "m" | "h" | "d"}`,
	};

	static googleOAuth = {
		clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
		clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
	};
}

export default EnvVariables;
