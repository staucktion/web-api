import UserDto from "src/dto/auth/UserDto";
import jwt from "jsonwebtoken";
import Config from "src/config/Config";

class AuthService {
	/** gmail_id -> User */
	private users: Map<string, UserDto> = new Map();

	async getUser({ gmail_id }: { gmail_id: string }): Promise<UserDto | undefined> {
		return this.users.get(gmail_id);
	}

	async createUser(user: UserDto): Promise<UserDto> {
		this.users.set(user.gmail_id, user);
		return user;
	}

	generateJWT(gmail_id: string): string {
		return jwt.sign({ gmail_id }, Config.jwt.secret, { expiresIn: Config.jwt.expiresIn });
	}

	verifyJWT = (token: string) => {
		try {
			return jwt.verify(token, Config.jwt.secret);
		} catch (error) {
			return null;
		}
	};
}

export default AuthService;
