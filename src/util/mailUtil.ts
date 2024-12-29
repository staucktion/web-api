import { MailAction } from "src/types/mail/mailTypes";

export function isValidMailAction(action: any): action is MailAction {
	return Object.values(MailAction).includes(action);
}
