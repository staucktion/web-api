import { PrismaClient } from "@prisma/client";
import CustomError from "src/error/CustomError";
import CategoryDto from "src/dto/category/CategoryDto";
import { StatusEnum } from "src/types/statusEnum";
import PrismaUtil from "src/util/PrismaUtil";
import handlePrismaType from "src/util/handlePrismaType";
import handlePrismaError from "src/util/handlePrismaError";
class CategoryService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = PrismaUtil.getPrismaClient();
	}

	public async getAllCategories(): Promise<CategoryDto[]> {
		try {
			const instanceListTmp = await this.prisma.category.findMany({
				where: { is_deleted: false },
				include: {
					location: true,
					status: true,
					auction_list: { where: { is_deleted: false }, include: { status: true, photo_list: true } },
					photo_list: { where: { is_deleted: false }, include: { status: true } },
				},
			});

			return handlePrismaType(instanceListTmp).map(({ _location_id, _status_id, ...rest }) => rest);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	async getCategoryById(id: bigint | number): Promise<CategoryDto | null> {
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

	async getAllCategoriesByStatus(statusId: StatusEnum): Promise<CategoryDto[]> {
		try {
			const categories = await this.prisma.category.findMany({
				where: {
					is_deleted: false,
					status_id: Number(statusId),
				},
			});

			return categories;
		} catch (error) {
			handlePrismaError(error);
		}
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

	async updateCategory(id: bigint | number, fieldsToUpdate: Partial<CategoryDto>): Promise<CategoryDto | null> {
		const updatedCategory = await this.prisma.category.update({
			where: { id },
			data: {
				...fieldsToUpdate,
				updated_at: new Date(),
			},
			include: {
				location: true,
				status: true,
			},
		});

		return updatedCategory;
	}

	async updateCategoryStatus(id: bigint, newStatus: StatusEnum, _reason?: string): Promise<CategoryDto> {
		try {
			// Check if category exists
			const existingCategory = await this.prisma.category.findUnique({
				where: { id },
			});

			if (!existingCategory || existingCategory.is_deleted) {
				CustomError.builder().setErrorType("Not Found").setStatusCode(404).setMessage("Category not found").build().throwError();
			}

			// Update category status
			const updatedCategory = await this.prisma.category.update({
				where: { id },
				data: {
					status_id: Number(newStatus),
					updated_at: new Date(),
					// Note: In the future, we'll store the reason in the database as well
				},
			});

			return updatedCategory;
		} catch (error) {
			if (error instanceof CustomError) throw error;

			handlePrismaError(error);
		}
	}

	async deleteCategory(id: bigint | number): Promise<boolean> {
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

	async getCategoriesByLocationIdAndStatus(locationId: bigint | number, statusId: StatusEnum): Promise<CategoryDto[]> {
		try {
			const categories = await this.prisma.category.findMany({
				where: {
					location_id: Number(locationId),
					status_id: Number(statusId),
					is_deleted: false,
				},
			});

			return categories;
		} catch (error) {
			handlePrismaError(error);
		}
	}

	async getCategoriesByCoordinatesAndStatus(userLat: number, userLng: number, statusId: StatusEnum): Promise<CategoryDto[]> {
		// Get all active categories with their locations
		const categories = await this.prisma.category.findMany({
			where: {
				is_deleted: false,
				status_id: Number(statusId),
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
