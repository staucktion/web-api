import { Response } from "express";
import Config from "src/config/Config";

export function redirectWithHost(res: Response, path: string) {
	res.redirect(`${Config.appUrl}${path}`);
}
