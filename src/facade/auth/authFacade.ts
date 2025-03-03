import express, { Request, Response } from "express";
import { authCookieOptions } from "src/constants/authConstants";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import { redirectWithHost } from "src/util/authUtil";
import sendJsonBigint from "src/util/sendJsonBigint";
import FormattedGoogleProfileDto from "src/dto/auth/FormattedGoogleProfileDto";

class AuthFacade {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	handleSuccessfulGoogleCallback = async (req: Request, res: Response): Promise<void> => {
		const reqN = req as unknown as express.RequestHandler & {
			passportUser: FormattedGoogleProfileDto;
		};
		const gmailProfileData = reqN.passportUser;

		let user: UserDto | undefined;
		const email = gmailProfileData.email.toLowerCase();
		try {
			user = await this.authService.getUser({
				gmail_id: gmailProfileData.gmail_id,
			});

			if (!user) {
				user = await this.authService.createUser({
					email,
					gmail_id: gmailProfileData.gmail_id,
					username: gmailProfileData.username,
					profile_picture: gmailProfileData.profile_picture,
					first_name: gmailProfileData.name.givenName,
					last_name: gmailProfileData.name.familyName,
				});
			}

			const token = this.authService.generateJWT(gmailProfileData.gmail_id);
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
				sendJsonBigint(res, { user });
			} else {
				res.clearCookie("token");
				res.status(200).json({ user: null });
			}
		} catch (error) {
			res.clearCookie("token");
			res.status(403).json({ message: "Invalid token. You have been logged out." });
		}
	};
}

export default AuthFacade;
