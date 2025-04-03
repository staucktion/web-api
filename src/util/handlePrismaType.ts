import { Decimal } from "@prisma/client/runtime/library";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePrismaType = (obj: any): any => {
	if (typeof obj === "bigint") {
		return Number(obj);
	} else if (obj instanceof Decimal) {
		return obj.toNumber();
	} else if (obj instanceof Date) {
		return obj.toISOString();
	} else if (Array.isArray(obj)) {
		return obj.map(handlePrismaType);
	} else if (typeof obj === "object" && obj !== null) {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, handlePrismaType(value)]));
	}
	return obj;
};

export default handlePrismaType;
