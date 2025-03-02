export default interface GoogleProfileDto {
	provider: "google";
	sub: string;
	id: string;
	displayName: string;
	name: { givenName: string; familyName: string };
	given_name: string;
	family_name: string;
	email_verified: boolean;
	verified: boolean;
	email: string;
	emails: { value: string; type: string }[];
	photos: { value: string; type: string }[];
	picture: string;
	_raw: string;
	_json: {
		sub: string;
		name: string;
		given_name: string;
		family_name: string;
		picture: string;
		email: string;
		email_verified: boolean;
	};
}
