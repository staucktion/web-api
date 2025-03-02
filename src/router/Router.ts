import express from "express";
import AuthEndpoint from "src/endpoint/auth/AuthEndpoint";
import CategoryEndpoint from "src/endpoint/category/CategoryEndpoint";
import HealthEndpoint from "src/endpoint/health/HealthEndpoint";
import LocationEndpoint from "src/endpoint/location/LocationEndpoint";
import MailEndpoint from "src/endpoint/mail/MailEndpoint";
import PhotoEndpoint from "src/endpoint/photo/PhotoEndpoint";

class Router {
	private healthEndpoint: HealthEndpoint;
	private photoEndpoint: PhotoEndpoint;
	private mailEndpoint: MailEndpoint;
	private authEndpoint: AuthEndpoint;
	private locationEndpoint: LocationEndpoint;
	private categoryEndpoint: CategoryEndpoint;

	constructor() {
		this.healthEndpoint = new HealthEndpoint();
		this.photoEndpoint = new PhotoEndpoint();
		this.mailEndpoint = new MailEndpoint();
		this.authEndpoint = new AuthEndpoint();
		this.locationEndpoint = new LocationEndpoint();
		this.categoryEndpoint = new CategoryEndpoint();
	}

	public setupRoute(app: express.Application): void {
		app.use(this.healthEndpoint.getRouter());
		app.use(this.photoEndpoint.getRouter());
		app.use(this.mailEndpoint.getRouter());
		app.use(this.authEndpoint.getRouter());
		app.use(this.locationEndpoint.getRouter());
		app.use(this.categoryEndpoint.getRouter());
	}
}

export default Router;
