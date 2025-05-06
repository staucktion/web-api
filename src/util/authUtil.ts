import { Response, Request } from "express";
import Config from "src/config/Config";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export function redirectWithHost(res: Response, path: string) {
	res.redirect(`${Config.appUrl}${path}`);
}

export function isRequestorValidator(req: Request): boolean {
	return req.user && req.user.user_role && ["validator", "admin"].includes(req.user.user_role.role);
}

export function isRequestorAdmin(req: Request): boolean {
	return req.user?.user_role?.role === "admin";
}

export function generateJWT(userId: number | bigint): string {
	return jwt.sign({ user_id: userId }, Config.jwt.secret, { expiresIn: Config.jwt.expiresIn });
}

export function verifyJWT(token: string): { user_id: number | bigint } | null {
	try {
		return jwt.verify(token, Config.jwt.secret) as { user_id: number | bigint };
	} catch (_error) {
		return null;
	}
};

export function getGravatarUrl(email: string): string {
	const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
	return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}