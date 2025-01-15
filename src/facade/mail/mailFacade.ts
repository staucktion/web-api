import { Request, Response } from "express";
import Config from "src/config/Config";
import EmailDto from "src/dto/email/EmailDto";
import CustomError from "src/error/CustomError";
import MailService from "src/service/mail/mailService";
import { MailAction } from "src/types/mailTypes";
import MailValidation from "src/validation/mail/MailValidation";

class MailFacade {
	private mailService: MailService;
	private mailValidation: MailValidation;

	constructor() {
		this.mailService = new MailService();
		this.mailValidation = new MailValidation();
	}

	public async sendMail(req: Request, res: Response): Promise<Response> {
		let emailDto: EmailDto;

		// get valid body from request
		try {
			emailDto = await this.mailValidation.sendMailRequest(req);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}

		try {
			await this.mailService.sendMail(emailDto.photoName, emailDto.action, emailDto.email);
		} catch (error: any) {
			if (error instanceof CustomError) {
				if (Config.explicitErrorLog) error.log();
				res.status(error.getStatusCode()).send(error.getMessage());
				return;
			}
		}

		return res.status(204).send();
	}
}

export default MailFacade;
