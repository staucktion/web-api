import { Response, Request } from "express";
import Config from "src/config/Config";

export function redirectWithHost(res: Response, path: string) {
	res.redirect(`${Config.appUrl}${path}`);
}

export function isRequestorValidator(req: Request): boolean {
	return req.user && req.user.user_role && ["validator", "admin"].includes(req.user.user_role.role);
}

export function isRequestorAdmin(req: Request): boolean {
	return req.user?.user_role?.role === "admin";
}
