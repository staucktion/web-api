interface NotificationDto {
	userId: number;
	type: "success" | "warning" | "info";
	message: string;
}

export default NotificationDto;
