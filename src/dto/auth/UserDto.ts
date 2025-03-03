export default interface UserDto {
	id: number | bigint;
	gmail_id: string;
	email: string;
	username: string;
	profile_picture: string;
	first_name: string;
	last_name: string;
	tc_identity_no: string | null;
}
