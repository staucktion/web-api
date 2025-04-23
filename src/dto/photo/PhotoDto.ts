import { Decimal } from "@prisma/client/runtime/library";

interface PhotoDto {
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
	user: {
		id: bigint;
		status_id: number | null;
		is_deleted: boolean;
		created_at: Date;
		updated_at: Date;
		gmail_id: string | null;
		username: string;
		email: string;
		password: string;
		first_name: string;
		last_name: string;
		tc_identity_no: string | null;
		profile_picture: string | null;
		role_id: bigint | null;
	};
}

export default PhotoDto;
