import { MailAction } from "src/types/mailTypes";

interface EmailDto {
	photoId: number;
	action: MailAction;
}

export default EmailDto;
