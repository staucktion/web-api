import { MailAction } from "src/types/mailTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidMailAction(action: any): action is MailAction {
	return Object.values(MailAction).includes(action);
}
