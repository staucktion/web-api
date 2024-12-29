import express from "express";
import HealthEndpoint from "src/endpoint/health/HealthEndpoint";
import PhotoEndpoint from "src/endpoint/photo/PhotoEndpoint";

class Router {
	private healthEndpoint: HealthEndpoint;
	private photoEndpoint: PhotoEndpoint;

	constructor() {
		this.healthEndpoint = new HealthEndpoint();
		this.photoEndpoint = new PhotoEndpoint();
	}

	public setupRoute(app: express.Application): void {
		app.use(this.healthEndpoint.getRouter());
		app.use(this.photoEndpoint.getRouter());
	}
}

export default Router;
