import { MailAction } from "src/types/mailTypes";

export default interface EmailDto {
	photoName: string;
	action: MailAction;
}
