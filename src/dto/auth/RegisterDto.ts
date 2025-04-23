interface RegisterDto {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	username?: string; // Optional, will be generated if not provided
}

export default RegisterDto;
