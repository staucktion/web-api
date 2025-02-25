import UserDto from "src/dto/auth/UserDto";
import jwt from "jsonwebtoken";
import Config from "src/config/Config";
import { PrismaClient } from "@prisma/client";
import PrismaUtil from "src/util/PrismaUtil";

class AuthService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	async getUser({ gmail_id }: Pick<UserDto, "gmail_id">): Promise<UserDto | undefined> {
		const user = await this.prisma.user.findFirst({
			where: {
				gmail_id,
				is_deleted: false,
			},
		});

		return user;
	}

	async createUser(user: UserDto): Promise<UserDto> {
		const usernameSplit = user.username.split(" ");

		console.log("got user");
		console.table(user);
		// TODO: Delete the password field if we decide to go with OAuth only
		await this.prisma.user.create({
			data: {
				...user,
				password: "disabled-oauth",
				first_name: usernameSplit[0],
				last_name: usernameSplit[usernameSplit.length - 1],
				is_deleted: false,
				created_at: new Date(),
				updated_at: new Date(),
				role_id: null,
				status_id: null,
			},
		});

		return user;
	}

	generateJWT(gmail_id: string): string {
		return jwt.sign({ gmail_id }, Config.jwt.secret, { expiresIn: Config.jwt.expiresIn });
	}

	verifyJWT = (token: string): Pick<UserDto, "gmail_id"> | null => {
		try {
			return jwt.verify(token, Config.jwt.secret) as Pick<UserDto, "gmail_id">;
		} catch (error) {
			return null;
		}
	};
}

export default AuthService;
