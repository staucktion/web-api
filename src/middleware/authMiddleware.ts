import { Request, Response, NextFunction } from "express";
import UserDto from "src/dto/auth/UserDto";
import AuthService from "src/service/auth/authService";

declare global {
	namespace Express {
		interface Request {
			user?: UserDto;
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
		} catch (error) {
			res.status(403).json({ message: "Invalid token" });
		}
	};
}
