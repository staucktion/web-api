import { MailAction } from "src/types/mailTypes";

export default interface EmailDto {
	photoId: number;
	action: MailAction;
}
