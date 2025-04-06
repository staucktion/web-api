import App from "./src/app/App.ts";

const app = new App();

app.init()
	.then(() => {
		app.listen();
	})
	.catch((error) => {
		console.error("❌ Failed to initialize the app:", error);
		process.exit(1);
	});
