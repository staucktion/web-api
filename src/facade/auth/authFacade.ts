import express, { Request, Response } from "express";
import { authCookieOptions } from "src/constants/authConstants";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import { redirectWithHost } from "src/util/authUtil";
import sendJsonBigint from "src/util/sendJsonBigint";
import { OAuth2Client } from "google-auth-library";
import Config from "src/config/Config";
import { StatusEnum } from "src/types/statusEnum";

class AuthFacade {
	private authService: AuthService;
	private googleClient: OAuth2Client;

	constructor() {
		this.authService = new AuthService();
		this.googleClient = new OAuth2Client(Config.googleOAuth.clientID);
	}

	handleSuccessfulGoogleCallback = async (req: Request, res: Response): Promise<void> => {
		const gmailProfileData = req.passportUser;

		let user: UserDto | undefined;
		const email = gmailProfileData.email.toLowerCase();
		try {
			user = await this.authService.getUser(
				{
					gmail_id: gmailProfileData.gmail_id,
				},
				true
			);

			if (!user) {
				user = await this.authService.createUser({
					email,
					gmail_id: gmailProfileData.gmail_id,
					username: gmailProfileData.username,
					profile_picture: gmailProfileData.profile_picture,
					first_name: gmailProfileData.name.givenName,
					last_name: gmailProfileData.name.familyName,
				});
			} else if (user.status_id === StatusEnum.BANNED) {
				redirectWithHost(res, `/?error=${encodeURIComponent("You have been banned from the platform. Please contact support. Thank you!")}`);
				return;
			}

			const token = this.authService.generateJWT(gmailProfileData.gmail_id);

			if (req.sendTokenAsJson) {
				res.json({ token });
			} else {
				res.cookie("token", token, authCookieOptions);

				redirectWithHost(res, "/");
			}
		} catch (err) {
			console.error("Unable to create session for user.gmail_id " + user?.gmail_id);
			redirectWithHost(res, `/?error=${encodeURIComponent("Unexpected error happened while logging in. Please contact support. Thank you!")}`);
			console.dir(err);
		}
	};

	handleGoogleAndroidAuth: express.RequestHandler = async (req, res, next) => {
		try {
			const { id_token } = req.body;
			if (!id_token) {
				res.status(400).json({ error: "No token provided" });
				return;
			}

			const ticket = await this.googleClient.verifyIdToken({
				idToken: id_token,
				audience: Config.googleOAuth.clientID,
			});

			const payload = ticket.getPayload();
			if (!payload) {
				res.status(401).json({ error: "Invalid token" });
				return;
			}

			req.passportUser = {
				gmail_id: payload.sub,
				username: `${payload.given_name} ${payload.family_name}`,
				profile_picture: payload.picture,
				email: payload.email,
				name: { givenName: payload.given_name, familyName: payload.family_name },
			};

			req.sendTokenAsJson = true;
			next();
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Token verification failed" });
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
				sendJsonBigint(res, { user: user ?? null });
			} else {
				res.clearCookie("token");
				res.status(200).json({ user: null });
			}
		} catch (_error) {
			res.clearCookie("token");
			res.status(403).json({ message: "Invalid token. You have been logged out." });
		}
	};
}

export default AuthFacade;
