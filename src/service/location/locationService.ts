import { PrismaClient } from "@prisma/client";
import LocationDto from "src/dto/location/LocationDto";
import PrismaUtil from "src/util/PrismaUtil";

class LocationService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	async getLocationById(id: bigint): Promise<LocationDto | null> {
		const location = await this.prisma.location.findUnique({
			where: { id },
		});

		return location;
	}

	async getAllLocations(): Promise<LocationDto[]> {
		const locations = await this.prisma.location.findMany();

		return locations;
	}

	async createLocation(location: LocationDto): Promise<LocationDto> {
		const newLocation = await this.prisma.location.create({
			data: {
				latitude: location.latitude,
				longitude: location.longitude,
			},
		});

		return newLocation;
	}

	async updateLocation(id: bigint, location: LocationDto): Promise<LocationDto | null> {
		const updatedLocation = await this.prisma.location.update({
			where: { id },
			data: {
				latitude: location.latitude,
				longitude: location.longitude,
			},
		});

		return updatedLocation;
	}

	async deleteLocation(id: bigint): Promise<boolean> {
		try {
			await this.prisma.location.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			console.error("Error deleting location:", error);
			return false;
		}
	}
}

export default LocationService;
