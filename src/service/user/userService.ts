import { PrismaClient } from "@prisma/client";
import UserDto from "src/dto/auth/UserDto";
import UpdateUserDto from "src/dto/user/UpdateUserDto";
import CustomError from "src/error/CustomError";
import PrismaUtil from "src/util/PrismaUtil";

class UserService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	async updateUser(userId: number | bigint, updateData: UpdateUserDto): Promise<UserDto> {
		try {
			// Check if user exists
			const existingUser = await this.prisma.user.findFirst({
				where: {
					id: BigInt(userId),
					is_deleted: false,
				},
			});

			if (!existingUser) {
				CustomError.builder().setMessage("User not found.").setErrorType("Not Found").setStatusCode(404).build().throwError();
			}

			// Update user
			const updatedUser = await this.prisma.user.update({
				where: {
					id: BigInt(userId),
				},
				data: {
					...updateData,
					updated_at: new Date(),
				},
			});

			// Convert BigInt to number for the DTO
			return updatedUser;
		} catch (error: any) {
			if (error instanceof CustomError) {
				throw error;
			}

			CustomError.builder()
				.setMessage("Failed to update user.")
				.setDetailedMessage(error.message || "Unknown error")
				.setErrorType("Database Error")
				.setStatusCode(500)
				.build()
				.throwError();
		}
	}

	async getUserById(userId: number): Promise<UserDto> {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					id: BigInt(userId),
					is_deleted: false,
				},
			});

			if (!user) {
				CustomError.builder().setMessage("User not found.").setErrorType("Not Found").setStatusCode(404).build().throwError();
			}

			return user;
		} catch (error: any) {
			if (error instanceof CustomError) {
				throw error;
			}

			CustomError.builder()
				.setMessage("Failed to retrieve user.")
				.setDetailedMessage(error.message || "Unknown error")
				.setErrorType("Database Error")
				.setStatusCode(500)
				.build()
				.throwError();
		}
	}
}

export default UserService;
