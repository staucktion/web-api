import { MailAction } from "src/types/mailTypes";

export default interface EmailDto {
	email: string;
	photoName: string;
	action: MailAction;
}
