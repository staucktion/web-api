import Config from "src/config/Config";

class AndroidNotificationService {
	constructor() {}

	public async sendAndroidNotification(userId: number, heading: string, content: string, data: Record<string, string>): Promise<void> {
		if (!Config.onesignal.appId || !Config.onesignal.apiKey) {
			console.warn("OneSignal app ID or API key is not set, skipping notification.");
			return;
		}

		const notificationBody = {
			app_id: Config.onesignal.appId,
			include_external_user_ids: [userId.toString()],
			headings: { en: heading },
			contents: { en: content },
			data,
		};

		try {
			const response = await fetch("https://onesignal.com/api/v1/notifications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${Config.onesignal.apiKey}`,
				},
				body: JSON.stringify(notificationBody),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Android Push Notification sent successfully:", data);
		} catch (error) {
			console.error("Failed to send Android Push Notification:", error);
		}
	}
}

export default AndroidNotificationService;
