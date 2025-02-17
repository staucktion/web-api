import UserDto from "src/dto/auth/UserDto";
import jwt from "jsonwebtoken";
import Config from "src/config/Config";
import { db } from "src/database";

class AuthService {
	async getUser({ gmail_id }: { gmail_id: string }): Promise<UserDto | undefined> {
		return await db.get(`/users/${gmail_id}`);
	}

	async createUser(user: UserDto): Promise<UserDto> {
		await db.set(`/users/${user.gmail_id}`, user);
		return user;
	}

	generateJWT(gmail_id: string): string {
		return jwt.sign({ gmail_id }, Config.jwt.secret, { expiresIn: Config.jwt.expiresIn });
	}

	verifyJWT = (token: string): { gmail_id: string } | null => {
		try {
			return jwt.verify(token, Config.jwt.secret) as { gmail_id: string };
		} catch (error) {
			return null;
		}
	};
}

export default AuthService;
