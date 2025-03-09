import { Request, Response } from "express";
import LocationDto from "src/dto/location/LocationDto";
import LocationService from "src/service/location/locationService";
import sendJsonBigint from "src/util/sendJsonBigint";

class LocationFacade {
	private locationService: LocationService;

	constructor() {
		this.locationService = new LocationService();
	}

	handleGetAllLocations = async (_req: Request, res: Response): Promise<void> => {
		try {
			const locations = await this.locationService.getAllLocations();
			sendJsonBigint(res, { locations });
		} catch (error) {
			console.error("Error fetching locations:", error);
			res.status(500).json({ message: "Failed to fetch locations" });
		}
	};

	handleGetLocationById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const location = await this.locationService.getLocationById(id);

			if (!location) {
				res.status(404).json({ message: "Location not found" });
				return;
			}

			sendJsonBigint(res, { location });
		} catch (error) {
			console.error("Error fetching location:", error);
			res.status(500).json({ message: "Failed to fetch location" });
		}
	};

	handleCreateLocation = async (req: Request, res: Response): Promise<void> => {
		try {
			const locationData: LocationDto = req.body;

			if (!locationData.latitude || !locationData.longitude) {
				res.status(400).json({ message: "Latitude and longitude are required" });
				return;
			}

			const newLocation = await this.locationService.createLocation(locationData);
			sendJsonBigint(res, { location: newLocation }, 201);
		} catch (error) {
			console.error("Error creating location:", error);
			res.status(500).json({ message: "Failed to create location" });
		}
	};

	handleUpdateLocation = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const locationData: LocationDto = req.body;

			if (!locationData.latitude || !locationData.longitude) {
				res.status(400).json({ message: "Latitude and longitude are required" });
				return;
			}

			const updatedLocation = await this.locationService.updateLocation(id, locationData);

			if (!updatedLocation) {
				res.status(404).json({ message: "Location not found" });
				return;
			}

			sendJsonBigint(res, { location: updatedLocation });
		} catch (error) {
			console.error("Error updating location:", error);
			res.status(500).json({ message: "Failed to update location" });
		}
	};

	handleDeleteLocation = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const success = await this.locationService.deleteLocation(id);

			if (!success) {
				res.status(404).json({ message: "Location not found or could not be deleted" });
				return;
			}

			res.status(200).json({ message: "Location deleted successfully" });
		} catch (error) {
			console.error("Error deleting location:", error);
			res.status(500).json({ message: "Failed to delete location" });
		}
	};
}

export default LocationFacade;
