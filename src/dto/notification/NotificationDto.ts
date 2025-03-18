export default interface NotificationDto {
	userId: number;
	type: "success" | "warning" | "info";
	message: string;
}
