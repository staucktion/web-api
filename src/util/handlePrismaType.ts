import { Decimal } from "@prisma/client/runtime/library";

const handlePrismaType = (obj: any): any => {
	if (typeof obj === "bigint") {
		return Number(obj);
	} else if (obj instanceof Decimal) {
		return obj.toNumber();
	} else if (Array.isArray(obj)) {
		return obj.map(handlePrismaType);
	} else if (typeof obj === "object" && obj !== null) {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, handlePrismaType(value)]));
	}
	return obj;
};

export default handlePrismaType;
