import { Request, Response } from "express";
import EmailDto from "src/dto/email/EmailDto";
import CustomError from "src/error/CustomError";
import MailService from "src/service/mail/mailService";
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
			CustomError.handleError(res, error);
			return;
		}

		try {
			await this.mailService.sendMail(emailDto.photoName, emailDto.action, emailDto.email);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		return res.status(204).send();
	}
}

export default MailFacade;
