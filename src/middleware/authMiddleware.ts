import { Request, Response, NextFunction } from "express";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";
import FormattedGoogleProfileDto from "src/dto/auth/FormattedGoogleProfileDto";

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
			const tokenContent = this.authService.verifyJWT(token);

			if (!tokenContent) {
				res.status(403).json({ message: "Invalid token" });
				return;
			}

			const user = await this.authService.getUser({ gmail_id: tokenContent.gmail_id });

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

	public validateValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Since this middleware runs after authMiddleware, we know req.user exists
		// But we'll double check just to be safe
		if (!req.user) {
			res.status(401).json({ message: "Access Denied! No token provided." });
			return;
		}

		// Check if user has a role and if it's a validator (admin is also allowed)
		if (!req.user.user_role || !["validator", "admin"].includes(req.user.user_role.role)) {
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
		if (!req.user.user_role || req.user.user_role.role !== "admin") {
			res.status(403).json({ message: "Access Denied! User is not an admin." });
			return;
		}

		next();
	};
}
