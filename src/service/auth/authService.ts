import UserDto from "src/dto/auth/UserDto";
import jwt from "jsonwebtoken";
import Config from "src/config/Config";
import { PrismaClient } from "@prisma/client";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaType from "src/util/handlePrismaType";
import { StatusEnum } from "src/types/statusEnum";
import bcrypt from "bcrypt";
import crypto from "crypto";
import LoginDto from "src/dto/auth/LoginDto";
import RegisterDto from "src/dto/auth/RegisterDto";
import CustomError from "src/error/CustomError";

class AuthService {
	private prisma: PrismaClient;
	private saltRounds = 10;

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

	async getUserByEmail(email: string, fetchBannedUsers = false): Promise<UserDto | undefined> {
		const user = await this.prisma.user.findFirst({
			where: {
				email: email.toLowerCase(),
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

	async registerUser(registerData: RegisterDto): Promise<UserDto> {
		// Check if email already exists
		const existingUser = await this.getUserByEmail(registerData.email);
		if (existingUser) {
			CustomError.builder().setMessage("Email already in use.").setErrorType("Authentication").setStatusCode(400).build().throwError();
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(registerData.password, this.saltRounds);

		// Generate username if not provided
		const username = registerData.username || `${registerData.first_name} ${registerData.last_name}`;

		// Generate gravatar URL for profile picture
		const gravatarUrl = this.getGravatarUrl(registerData.email);

		// Generate a random gmail_id for email/password users - this is needed to maintain compatibility
		// with the existing JWT token system that uses gmail_id
		const randomGmailId = `local_${crypto.randomBytes(16).toString("hex")}`;

		const createdUser = await this.prisma.user.create({
			data: {
				email: registerData.email.toLowerCase(),
				gmail_id: randomGmailId,
				username,
				password: hashedPassword,
				first_name: registerData.first_name,
				last_name: registerData.last_name,
				profile_picture: gravatarUrl,
				is_deleted: false,
				created_at: new Date(),
				updated_at: new Date(),
				role_id: null,
				status_id: null,
			},
		});

		return handlePrismaType(createdUser);
	}

	async loginUser(loginData: LoginDto): Promise<UserDto> {
		// Find user by email
		const user = await this.getUserByEmail(loginData.email);
		if (!user) {
			CustomError.builder().setMessage("Invalid email or password.").setErrorType("Authentication").setStatusCode(401).build().throwError();
		}

		// Check if the user is banned
		if (user.status_id === StatusEnum.BANNED) {
			CustomError.builder().setMessage("Your account has been banned. Please contact support.").setErrorType("Authentication").setStatusCode(403).build().throwError();
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
		if (!isPasswordValid) {
			CustomError.builder().setMessage("Invalid email or password.").setErrorType("Authentication").setStatusCode(401).build().throwError();
		}

		return user;
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

	getGravatarUrl(email: string): string {
		const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
		return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
	}
}

export default AuthService;
