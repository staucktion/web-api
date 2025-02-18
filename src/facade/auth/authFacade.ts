import express, { Request, Response } from "express";
import { authCookieOptions } from "src/constants/authConstants";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import { redirectWithHost } from "src/util/authUtil";

class AuthFacade {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	handleSuccessfulGoogleCallback = async (req: Request, res: Response): Promise<void> => {
		const reqN = req as unknown as express.RequestHandler & {
			passportUser: Pick<UserDto, "email" | "username" | "gmail_id">;
		};
		const profData = reqN.passportUser;

		let user: UserDto | undefined;
		const email = profData.email.toLowerCase();
		try {
			user = await this.authService.getUser({
				gmail_id: profData.gmail_id,
			});

			if (!user) {
				user = await this.authService.createUser({
					email,
					gmail_id: profData.gmail_id,
					username: profData.username,
				});
			}

			const token = this.authService.generateJWT(profData.gmail_id);
			res.cookie("token", token, authCookieOptions);

			redirectWithHost(res, "/");
		} catch (err) {
			console.error("Unable to create session for user.gmail_id " + user?.gmail_id);
			redirectWithHost(res, `/?error=${encodeURIComponent(`Unexpected error happened while logging in. Please contact support. Thank you!`)}`);
			console.dir(err);
		}
	};

	handleLogout = async (_req: Request, res: Response): Promise<void> => {
		res.clearCookie("token");
		redirectWithHost(res, "/");
	};

	handleAuthError = async (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): Promise<void> => {
		console.error("An error occurred while logging in: " + error.message);
		redirectWithHost(res, `/?error=${encodeURIComponent("An error occurred while logging in. Please try again!")}`);
	};

	handleUserInfo = async (req: Request, res: Response): Promise<void> => {
		const token = req.cookies?.token;

		if (!token) {
			res.status(200).json({ user: null });
			return;
		}

		try {
			const tokenContent = this.authService.verifyJWT(token);

			if (tokenContent) {
				const user = await this.authService.getUser({ gmail_id: tokenContent.gmail_id });
				res.status(200).json({ user });
			} else {
				res.clearCookie("token");
				res.status(200).json({ user: null });
			}
		} catch (error) {
			res.status(403).json({ message: "Invalid token" });
		}
	};
}

export default AuthFacade;
