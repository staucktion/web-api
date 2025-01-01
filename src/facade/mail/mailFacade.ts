import { Request, Response } from "express";
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
		let photoName: string, action: MailAction, email: string;

		// get valid body from request
		try {
			const validated = await this.mailValidation.sendMailRequest(req);
			action = validated.action;
			photoName = validated.photoName;
			email = validated.email;
		} catch (e: any) {
			return res.status(400).send({ error: e.message });
		}

		try {
			await this.mailService.sendMail(photoName, action, email);
		} catch (error: any) {
			return res.status(500).send(error.message);
		}

		return res.status(200).send({ message: "Email sent successfully" });
	}
}

export default MailFacade;
