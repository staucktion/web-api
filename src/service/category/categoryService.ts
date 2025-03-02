import { PrismaClient } from "@prisma/client";
import CategoryDto from "src/dto/category/CategoryDto";
import PrismaUtil from "src/util/PrismaUtil";

class CategoryService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	async getCategoryById(id: bigint): Promise<CategoryDto | null> {
		const category = await this.prisma.category.findUnique({
			where: {
				id,
				is_deleted: false,
			},
			include: {
				location: true,
				status: true,
			},
		});

		return category;
	}

	async getAllCategories(): Promise<CategoryDto[]> {
		const categories = await this.prisma.category.findMany({
			where: {
				is_deleted: false,
			},
			include: {
				location: true,
				status: true,
			},
		});

		return categories;
	}

	async createCategory(category: CategoryDto): Promise<CategoryDto> {
		const now = new Date();

		const newCategory = await this.prisma.category.create({
			data: {
				name: category.name,
				status_id: category.status_id,
				address: category.address,
				location_id: category.location_id,
				valid_radius: category.valid_radius,
				is_deleted: false,
				created_at: now,
				updated_at: now,
			},
			include: {
				location: true,
				status: true,
			},
		});

		return newCategory;
	}

	async updateCategory(id: bigint, category: CategoryDto): Promise<CategoryDto | null> {
		const updatedCategory = await this.prisma.category.update({
			where: { id },
			data: {
				name: category.name,
				status_id: category.status_id,
				address: category.address,
				location_id: category.location_id,
				valid_radius: category.valid_radius,
				updated_at: new Date(),
			},
			include: {
				location: true,
				status: true,
			},
		});

		return updatedCategory;
	}

	async deleteCategory(id: bigint): Promise<boolean> {
		try {
			// Soft delete - we set is_deleted to true rather than removing the record
			await this.prisma.category.update({
				where: { id },
				data: {
					is_deleted: true,
					updated_at: new Date(),
				},
			});
			return true;
		} catch (error) {
			console.error("Error deleting category:", error);
			return false;
		}
	}

	async getCategoriesByLocationId(locationId: bigint): Promise<CategoryDto[]> {
		const categories = await this.prisma.category.findMany({
			where: {
				location_id: locationId,
				is_deleted: false,
			},
			include: {
				location: true,
				status: true,
			},
		});

		return categories;
	}

	async getCategoriesByCoordinates(latitude: string, longitude: string): Promise<CategoryDto[]> {
		// Get all active categories with their locations
		const categories = await this.prisma.category.findMany({
			where: {
				is_deleted: false,
			},
			include: {
				location: true,
				status: true,
			},
		});

		// Filter categories based on whether the provided coordinates are within the category's valid radius
		const matchingCategories = categories.filter((category) => {
			if (!category.location) return false;

			const categoryLat = parseFloat(category.location.latitude);
			const categoryLng = parseFloat(category.location.longitude);
			const userLat = parseFloat(latitude);
			const userLng = parseFloat(longitude);
			const radiusKm = parseFloat(category.valid_radius.toString());

			// Calculate distance using Haversine formula
			const distance = this.calculateDistance(userLat, userLng, categoryLat, categoryLng);

			// Check if the distance is within the category's valid radius
			return distance <= radiusKm;
		});

		return matchingCategories;
	}

	// Haversine formula to calculate distance between two points on Earth
	private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371; // Earth's radius in kilometers
		const dLat = this.deg2rad(lat2 - lat1);
		const dLon = this.deg2rad(lon2 - lon1);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in kilometers

		return distance;
	}

	private deg2rad(deg: number): number {
		return deg * (Math.PI / 180);
	}
}

export default CategoryService;
