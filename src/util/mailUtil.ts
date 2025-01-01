import { MailAction } from "src/types/mailTypes";

export function isValidMailAction(action: any): action is MailAction {
	return Object.values(MailAction).includes(action);
}
