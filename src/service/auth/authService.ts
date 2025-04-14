import UserDto from "src/dto/auth/UserDto";
import jwt from "jsonwebtoken";
import Config from "src/config/Config";
import { PrismaClient } from "@prisma/client";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaType from "src/util/handlePrismaType";
import { StatusEnum } from "src/types/statusEnum";

class AuthService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	async getUser({ gmail_id }: Pick<UserDto, "gmail_id">, fetchBannedUsers = false): Promise<UserDto | undefined> {
		const user = await this.prisma.user.findFirst({
			where: {
				gmail_id,
				is_deleted: false,
			},
			include: {
				user_role: true,
				status: true,
			},
		});

		if (!fetchBannedUsers && user && user.status_id === StatusEnum.BANNED) {
			return undefined;
		}

		return handlePrismaType(user);
	}

	async createUser(user: Pick<UserDto, "email" | "gmail_id" | "username" | "profile_picture" | "first_name" | "last_name">): Promise<UserDto> {
		const usernameSplit = user.username.split(" ");

		// TODO: Delete the password field if we decide to go with OAuth only
		const createdUser = await this.prisma.user.create({
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

		return handlePrismaType(createdUser);
	}

	generateJWT(gmail_id: string): string {
		return jwt.sign({ gmail_id }, Config.jwt.secret, { expiresIn: Config.jwt.expiresIn });
	}

	verifyJWT = (token: string): Pick<UserDto, "gmail_id"> | null => {
		try {
			return jwt.verify(token, Config.jwt.secret) as Pick<UserDto, "gmail_id">;
		} catch (_error) {
			return null;
		}
	};
}

export default AuthService;
