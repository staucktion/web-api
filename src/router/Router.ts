import express from "express";
import FrontendEndpoint from "src/endpoint/frontend/FrontendEndpoint";
import HealthEndpoint from "src/endpoint/health/HealthEndpoint";
import MailEndpoint from "src/endpoint/mail/MailEndpoint";
import PhotoEndpoint from "src/endpoint/photo/PhotoEndpoint";

class Router {
	private healthEndpoint: HealthEndpoint;
	private photoEndpoint: PhotoEndpoint;
	private mailEndpoint: MailEndpoint;
	private frontendEndpoint: FrontendEndpoint;

	constructor() {
		this.healthEndpoint = new HealthEndpoint();
		this.photoEndpoint = new PhotoEndpoint();
		this.mailEndpoint = new MailEndpoint();
		this.frontendEndpoint = new FrontendEndpoint();
	}

	public setupRoute(app: express.Application): void {
		app.use(this.healthEndpoint.getRouter());
		app.use(this.photoEndpoint.getRouter());
		app.use(this.mailEndpoint.getRouter());
		app.use(this.frontendEndpoint.getRouter());
	}
}

export default Router;
