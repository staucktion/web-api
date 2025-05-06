import { Request, Response, NextFunction } from "express";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import FormattedGoogleProfileDto from "src/dto/auth/FormattedGoogleProfileDto";
import { isRequestorAdmin, isRequestorValidator, verifyJWT } from "src/util/authUtil";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: UserDto;
			passportUser?: FormattedGoogleProfileDto;
			sendTokenAsJson?: boolean;
		}
	}
}

export class AuthMiddleware {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	public authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const token = req.cookies?.token;

		if (!token) {
			res.status(401).json({ message: "Access Denied! No token provided." });
			return;
		}

		try {
			const tokenContent = verifyJWT(token);

			if (!tokenContent) {
				res.status(403).json({ message: "Invalid token" });
				return;
			}

			const user = await this.authService.getUserById(tokenContent.user_id);

			if (user) {
				req.user = user;
				next();
			} else {
				res.status(403).json({ message: "Invalid token" });
			}
		} catch (_error) {
			res.status(403).json({ message: "Invalid token" });
		}
	};

	/**
	 * Same as authenticateJWT, but only adds the user to the request if the token exists, otherwise it does not interrupt anything
	 * This is useful for endpoints that are not protected by authentication, but still need to check if a user is authenticated
	 */
	public addUserToRequestIfTokenExists = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const token = req.cookies?.token;
		if (!token) {
			next();
			return;
		}

		try {
			const tokenContent = verifyJWT(token);
			if (!tokenContent) {
				next();
				return;
			}

			const user = await this.authService.getUserById(tokenContent.user_id);
			if (user) {
				req.user = user;
				next();
			} else {
				next();
			}
		} catch (_error) {
			next();
		}
	};

	public validateValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Since this middleware runs after authMiddleware, we know req.user exists
		// But we'll double check just to be safe
		if (!req.user) {
			res.status(401).json({ message: "Access Denied! No token provided." });
			return;
		}

		// Check if user has a role and if it's a validator (admin is also allowed)
		if (!isRequestorValidator(req)) {
			res.status(403).json({ message: "Access Denied! User is not a validator." });
			return;
		}

		next();
	};

	public validateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Since this middleware runs after authMiddleware, we know req.user exists
		// But we'll double check just to be safe
		if (!req.user) {
			res.status(401).json({ message: "Access Denied! No token provided." });
			return;
		}

		// Check if user has a role and if it's an admin
		if (!isRequestorAdmin(req)) {
			res.status(403).json({ message: "Access Denied! User is not an admin." });
			return;
		}

		next();
	};
}
