import CustomError from "src/error/CustomError";
import nodemailer from "nodemailer";
import Config from "src/config/Config";
import { MailAction } from "src/types/mailTypes";

let transporter: nodemailer.Transporter | null = null;

if (
	[
		Config.email.to,
		Config.email.from,
		Config.email.pass,
		Config.email.service,
	].every(Boolean)
) {
	transporter = nodemailer.createTransport({
		service: Config.email.service,
		auth: {
			user: Config.email.from,
			pass: Config.email.pass,
		},
	});
} else {
	console.warn(
		"Email configuration is not set up properly. Email service will not work."
	);
}

class MailService {
	public async sendMail(action: MailAction): Promise<void> {
		if (!transporter) {
			CustomError.builder()
				.setErrorType("Server Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMail")
				.setMessage("Emails cannot be sent at the moment.")
				.build()
				.throwError();
			throw Error(
				"This throw is unreachable, but required for compilation at the moment due to CustomError.throwError() being a void function."
			);
		}

		try {
			const mailOptions = {
				from: Config.email.from, // TODO: maybe also add name alias here
				to: Config.email.to,
				subject: "ST{AU}CKTION: Action Selected",
				text: `The selected action is: ${action}`,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error("Error sending email:", error);
					throw error;
				} else {
					console.log("Email sent:", info.response);
				}
			});
		} catch (error: any) {
			CustomError.builder()
				.setErrorType("Server Error")
				.setClassName(this.constructor.name)
				.setMethodName("sendMail")
				.setError(error)
				.build()
				.throwError();
			console.error("Error sending mail:", error);
			throw error;
		}
	}
}

export default MailService;
