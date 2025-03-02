import { Decimal } from "@prisma/client/runtime/library";

interface CategoryDto {
	id?: bigint;
	name: string;
	status_id?: number | null;
	address: string;
	location_id?: bigint | null;
	valid_radius: Decimal | number;
	is_deleted?: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export default CategoryDto;
