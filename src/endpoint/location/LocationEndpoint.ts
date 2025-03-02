import express, { Router } from "express";
import LocationFacade from "src/facade/location/locationFacade";

class LocationEndpoint {
	private locationFacade: LocationFacade;
	private router: Router;

	constructor() {
		this.locationFacade = new LocationFacade();
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Get all locations
		this.router.get("/locations", this.locationFacade.handleGetAllLocations);

		// Get location by ID
		this.router.get("/locations/:id", this.locationFacade.handleGetLocationById);

		// Create a new location
		this.router.post("/locations", this.locationFacade.handleCreateLocation);

		// Update a location
		this.router.put("/locations/:id", this.locationFacade.handleUpdateLocation);

		// Delete a location
		this.router.delete("/locations/:id", this.locationFacade.handleDeleteLocation);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default LocationEndpoint;
