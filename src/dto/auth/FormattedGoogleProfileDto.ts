export default interface FormattedGoogleProfileDto {
	gmail_id: string;
	email: string;
	username: string;
	profile_picture: string;
	name: { givenName: string; familyName: string };
}
