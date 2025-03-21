interface UserDto {
	id: number;
	gmail_id: string;
	email: string;
	username: string;
	profile_picture: string;
	first_name: string;
	last_name: string;
	tc_identity_no: string | null;
	user_role?: {
		id: number | bigint;
		role: string;
	};
}

export default UserDto;
