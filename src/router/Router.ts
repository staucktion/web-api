import express from "express";
import AuthEndpoint from "src/endpoint/auth/AuthEndpoint";
import BankEndpoint from "src/endpoint/bank/BankEndpoint";
import HealthEndpoint from "src/endpoint/health/HealthEndpoint";
import MailEndpoint from "src/endpoint/mail/MailEndpoint";
import PhotoEndpoint from "src/endpoint/photo/PhotoEndpoint";

class Router {
	private healthEndpoint: HealthEndpoint;
	private photoEndpoint: PhotoEndpoint;
	private mailEndpoint: MailEndpoint;
	private authEndpoint: AuthEndpoint;
	private bankEndpoint: BankEndpoint;

	constructor() {
		this.healthEndpoint = new HealthEndpoint();
		this.photoEndpoint = new PhotoEndpoint();
		this.mailEndpoint = new MailEndpoint();
		this.authEndpoint = new AuthEndpoint();
		this.bankEndpoint = new BankEndpoint();
	}

	public setupRoute(app: express.Application): void {
		app.use(this.healthEndpoint.getRouter());
		app.use(this.photoEndpoint.getRouter());
		app.use(this.mailEndpoint.getRouter());
		app.use(this.authEndpoint.getRouter());
		app.use(this.bankEndpoint.getRouter());
	}
}

export default Router;
