import dotenv from "dotenv";
dotenv.config();

class EnvVariables {
	static port: number = parseInt(process.env.PORT);
	static mode: string = process.env.MODE;
	static requestLog: boolean = process.env.REQUEST_LOG === "true";
	static explicitErrorLog: boolean = process.env.EXPLICIT_ERROR_LOG === "true";
	static multerFileSize = parseInt(process.env.MULTER_FILE_SIZE);
	static bankUrl: string = process.env.BANK_URL;
	static provisionAmount: number = parseInt(process.env.PROVISION);
	static initialAuctionPrice: number = parseInt(process.env.INITIAL_AUCTION_PRICE);

	static watermark = {
		fontSize: parseFloat(process.env.WATERMARK_FONT_SIZE),
		transparency: parseFloat(process.env.WATERMARK_TRANSPARENCY),
		text: process.env.WATERMARK_TEXT,
	};

	static email = {
		from: process.env.EMAIL_FROM,
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
		smtp: process.env.EMAIL_SMTP,
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
