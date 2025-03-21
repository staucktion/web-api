import { PrismaClient } from "@prisma/client";
import UserDto from "src/dto/auth/UserDto";
import UpdateUserDto from "src/dto/user/UpdateUserDto";
import CustomError from "src/error/CustomError";
import handlePrismaType from "src/util/handlePrismaType";
import handlePrismaError from "src/util/handlePrismaError";
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
			return handlePrismaType(updatedUser);
		} catch (error) {
			if (error instanceof CustomError) {
				throw error;
			}

			handlePrismaError(error);
		}
	}

	async getUserById(userId: number): Promise<UserDto> {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					id: BigInt(userId),
					is_deleted: false,
				},
				include: {
					status: true,
				},
			});

			if (!user) {
				CustomError.builder().setMessage("User not found.").setErrorType("Not Found").setStatusCode(404).build().throwError();
			}

			return handlePrismaType(user);
		} catch (error) {
			if (error instanceof CustomError) {
				throw error;
			}

			handlePrismaError(error);
		}
	}
}

export default UserService;
