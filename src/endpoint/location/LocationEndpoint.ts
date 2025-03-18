import express, { Router } from "express";
import LocationFacade from "src/facade/location/locationFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class LocationEndpoint {
	private locationFacade: LocationFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.locationFacade = new LocationFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Get all locations - public access
		this.router.get("/locations", this.locationFacade.handleGetAllLocations);

		// Get location by ID - public access
		this.router.get("/locations/:id", this.locationFacade.handleGetLocationById);

		// Create a new location - authenticated access
		this.router.post("/locations", this.authMiddleware.authenticateJWT, this.locationFacade.handleCreateLocation);

		// Update a location - authenticated access (validator)
		this.router.put("/locations/:id", this.authMiddleware.authenticateJWT, this.authMiddleware.validateValidator, this.locationFacade.handleUpdateLocation);

		// Delete a location - authenticated access (admin)
		this.router.delete("/locations/:id", this.authMiddleware.authenticateJWT, this.authMiddleware.validateAdmin, this.locationFacade.handleDeleteLocation);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default LocationEndpoint;
