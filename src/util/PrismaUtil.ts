import { PrismaClient } from "@prisma/client";

class PrismaUtil {
	private static prisma: PrismaClient;

	private constructor() {}

	public static getPrismaClient(): PrismaClient {
		if (!PrismaUtil.prisma) {
			PrismaUtil.prisma = new PrismaClient();
		}
		return PrismaUtil.prisma;
	}
}

export default PrismaUtil;
