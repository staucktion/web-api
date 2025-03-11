import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import nodemailer from "nodemailer";
import * as path from "path";
import Config from "src/config/Config";
import { ORIGINAL_PHOTO_DIR } from "src/constants/photoConstants";
import CustomError from "src/error/CustomError";
import { MailAction } from "src/types/mailTypes";
import PrismaUtil from "src/util/PrismaUtil";

let transporter: nodemailer.Transporter | null = null;

if ([Config.email.from, Config.email.pass, Config.email.service].every(Boolean)) {
	transporter = nodemailer.createTransport({
		service: Config.email.service,
		auth: {
			user: Config.email.from,
			pass: Config.email.pass,
		},
	});
} else {
	console.warn("Email configuration is not set up properly. Email service will not work.");
}

class MailService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async sendMail(photoId: number, action: MailAction, receiverEmail: string): Promise<void> {
		if (!transporter) CustomError.builder().setMessage("Transporter not reachable.").setErrorType("Email Error").setStatusCode(500).build().throwError();

		const photoDto = await this.prisma.photo.findUnique({
			where: {
				id: photoId,
			},
		});

		if (!photoDto) CustomError.builder().setMessage("Photo not found.").setErrorType("Database Error").setStatusCode(404).build().throwError();

		const photoName = photoDto.file_path;
		const photoPath = path.join(ORIGINAL_PHOTO_DIR, photoName);
		const photoExists = fs.existsSync(photoPath);

		if (!photoExists) CustomError.builder().setMessage("Requested photo does not exist.").setErrorType("File Error").setStatusCode(400).build().throwError();

		try {
			let subject = `Purchase ${action.split(" ")[0]}`;
			if (subject.endsWith("e")) {
				subject += "d"; // approve -> approved
			} else {
				subject += "ed"; // reject -> rejected
			}

			const mailOptions: nodemailer.SendMailOptions = {
				from: `ST{AU}CKTION <${Config.email.from}>`,
				to: receiverEmail,
				subject,
				text: `The selected action for image '${photoName}' is: ${action}`,
			};

			if (action === MailAction.APPROVE_PURCHASE) {
				mailOptions.attachments = [
					{
						filename: `original-${photoName}`,
						path: photoPath,
					},
				];
				mailOptions.text += "\n\nThe image you purchased is attached.";
			}

			await new Promise<void>((resolve, reject) => {
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) reject(error);
					else resolve();
				});
			});

			await this.prisma.photo.update({
				where: {
					id: photoDto.id,
				},
				data: {
					is_deleted: true,
				},
			});
		} catch (error: any) {
			CustomError.builder().setMessage("Cannot send email.").setDetailedMessage(error.message).setErrorType("Email Error").setStatusCode(500).build().throwError();
		}
	}
}

export default MailService;
