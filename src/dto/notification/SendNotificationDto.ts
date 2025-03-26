interface SendNotificationDto {
	userId: number;
	type: "success" | "warning" | "info";
	message: string;
}

export default SendNotificationDto;
