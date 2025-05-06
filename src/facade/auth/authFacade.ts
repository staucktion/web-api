import express, { Request, Response } from "express";
import { authCookieOptions } from "src/constants/authConstants";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import { generateJWT, redirectWithHost, verifyJWT } from "src/util/authUtil";
import sendJsonBigint from "src/util/sendJsonBigint";
import { OAuth2Client } from "google-auth-library";
import Config from "src/config/Config";
import { StatusEnum } from "src/types/statusEnum";
import AuthValidation from "src/validation/auth/AuthValidation";
import CustomError from "src/error/CustomError";

class AuthFacade {
	private authService: AuthService;
	private authValidation: AuthValidation;
	private googleClient: OAuth2Client;

	constructor() {
		this.authService = new AuthService();
		this.authValidation = new AuthValidation();
		this.googleClient = new OAuth2Client(Config.googleOAuth.clientID);
	}

	handleSuccessfulGoogleCallback = async (req: Request, res: Response): Promise<void> => {
		const gmailProfileData = req.passportUser;

		let user: UserDto | undefined;
		const email = gmailProfileData.email.toLowerCase();
		try {
			user = await this.authService.getUserByGmailId(gmailProfileData.gmail_id, true);

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

			const token = generateJWT(user.id);

			if (req.sendTokenAsJson) {
				res.json({ token });
			} else {
				res.cookie("token", token, authCookieOptions);

				redirectWithHost(res, "/");
			}
		} catch (err) {
			console.error("Unable to create session for user.id " + user?.id);
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

	handleLogin = async (req: Request, res: Response): Promise<void> => {
		try {
			// Validate request
			const loginDto = await this.authValidation.validateLoginRequest(req);

			// Login user
			const user = await this.authService.loginUser(loginDto);

			// Generate JWT
			const token = generateJWT(user.id);

			// Set cookie and redirect
			res.cookie("token", token, authCookieOptions);
			redirectWithHost(res, "/");
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	handleRegister = async (req: Request, res: Response): Promise<void> => {
		try {
			// Validate request
			const registerDto = await this.authValidation.validateRegisterRequest(req);

			// Register user
			await this.authService.registerUser(registerDto);

			redirectWithHost(res, "/");
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	handleLoginAndroid = async (req: Request, res: Response): Promise<void> => {
		try {
			// Validate request
			const loginDto = await this.authValidation.validateLoginRequest(req);

			// Login user
			const user = await this.authService.loginUser(loginDto);

			// Generate JWT
			const token = generateJWT(user.id);

			// Return token as JSON
			res.json({ token });
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	handleRegisterAndroid = async (req: Request, res: Response): Promise<void> => {
		try {
			// Validate request
			const registerDto = await this.authValidation.validateRegisterRequest(req);

			// Register user
			const user = await this.authService.registerUser(registerDto);

			// Generate JWT
			const token = generateJWT(user.id);

			// Return token as JSON
			res.json({ token, message: "User registered successfully. Please verify your email address first by clicking the link in the verification email before logging in." });
		} catch (error) {
			CustomError.handleError(res, error);
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
			const tokenContent = verifyJWT(token);

			if (tokenContent) {
				const user = await this.authService.getUserById(tokenContent.user_id);
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

	handleVerifyEmail = async (req: Request, res: Response): Promise<void> => {
		const token = req.query.token as string;

		if (!token) {
			redirectWithHost(res, `/?error=${encodeURIComponent("Invalid e-mail verification link. Please try again!")}`);
			return;
		}

		const tokenContent = verifyJWT(token);

		if (tokenContent) {
			const user = await this.authService.getUserById(tokenContent.user_id);
			if (user) {
				await this.authService.verifyEmail(user.id);
				redirectWithHost(res, `/?success=${encodeURIComponent("E-mail verified successfully. You can now log in.")}`);
			}
		}

		redirectWithHost(res, `/?error=${encodeURIComponent("Invalid e-mail verification link. Please try again!")}`);
	};
}

export default AuthFacade;
