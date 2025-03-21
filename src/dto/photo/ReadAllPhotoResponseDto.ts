import { Decimal } from "@prisma/client/runtime/library";

interface ReadAllPhotoResponseDto {
	id: number;
	file_path: string;
	title: string;
	device_info: string;
	vote_count: number;
	user_id: number;
	auction_id: number;
	location_id: number;
	category_id: number;
	status_id: number;
	is_auctionable: boolean;
	purchase_now_price: number | null;
	purchased_at: Date | null;
	created_at: Date;
	updated_at: Date;
	category: {
		id: bigint;
		location_id: bigint | null;
		status_id: number | null;
		is_deleted: boolean;
		created_at: Date;
		updated_at: Date;
		name: string;
		address: string;
		valid_radius: Decimal;
		location: {
			id: bigint;
			latitude: string;
			longitude: string;
		};
	};
	status: {
		id: number;
		status: string;
	};
}

export default ReadAllPhotoResponseDto;
