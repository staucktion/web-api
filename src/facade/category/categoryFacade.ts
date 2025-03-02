import { Request, Response } from "express";
import CategoryDto from "src/dto/category/CategoryDto";
import CategoryService from "src/service/category/categoryService";
import sendJsonBigint from "src/util/sendJsonBigint";

class CategoryFacade {
	private categoryService: CategoryService;

	constructor() {
		this.categoryService = new CategoryService();
	}

	handleGetAllCategories = async (_req: Request, res: Response): Promise<void> => {
		try {
			const categories = await this.categoryService.getAllCategories();
			sendJsonBigint(res, { categories });
		} catch (error) {
			console.error("Error fetching categories:", error);
			res.status(500).json({ message: "Failed to fetch categories" });
		}
	};

	handleGetCategoryById = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const category = await this.categoryService.getCategoryById(id);

			if (!category) {
				res.status(404).json({ message: "Category not found" });
				return;
			}

			sendJsonBigint(res, { category });
		} catch (error) {
			console.error("Error fetching category:", error);
			res.status(500).json({ message: "Failed to fetch category" });
		}
	};

	handleCreateCategory = async (req: Request, res: Response): Promise<void> => {
		try {
			const categoryData: CategoryDto = req.body;

			if (!categoryData.name || !categoryData.address || categoryData.valid_radius === undefined) {
				res.status(400).json({ message: "Name, address, and valid_radius are required" });
				return;
			}

			const newCategory = await this.categoryService.createCategory(categoryData);
			sendJsonBigint(res, { category: newCategory }, 201);
		} catch (error) {
			console.error("Error creating category:", error);
			res.status(500).json({ message: "Failed to create category" });
		}
	};

	handleUpdateCategory = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const categoryData: CategoryDto = req.body;

			if (!categoryData.name || !categoryData.address || categoryData.valid_radius === undefined) {
				res.status(400).json({ message: "Name, address, and valid_radius are required" });
				return;
			}

			const updatedCategory = await this.categoryService.updateCategory(id, categoryData);

			if (!updatedCategory) {
				res.status(404).json({ message: "Category not found" });
				return;
			}

			sendJsonBigint(res, { category: updatedCategory });
		} catch (error) {
			console.error("Error updating category:", error);
			res.status(500).json({ message: "Failed to update category" });
		}
	};

	handleDeleteCategory = async (req: Request, res: Response): Promise<void> => {
		try {
			const id = BigInt(req.params.id);
			const success = await this.categoryService.deleteCategory(id);

			if (!success) {
				res.status(404).json({ message: "Category not found or could not be deleted" });
				return;
			}

			res.status(200).json({ message: "Category deleted successfully" });
		} catch (error) {
			console.error("Error deleting category:", error);
			res.status(500).json({ message: "Failed to delete category" });
		}
	};

	handleGetCategoriesByLocationId = async (req: Request, res: Response): Promise<void> => {
		try {
			const locationId = BigInt(req.params.locationId);
			const categories = await this.categoryService.getCategoriesByLocationId(locationId);

			sendJsonBigint(res, { categories });
		} catch (error) {
			console.error("Error fetching categories by location:", error);
			res.status(500).json({ message: "Failed to fetch categories by location" });
		}
	};

	handleGetCategoriesByCoordinates = async (req: Request, res: Response): Promise<void> => {
		try {
			const { latitude, longitude } = req.query;

			if (!latitude || !longitude) {
				res.status(400).json({ message: "Latitude and longitude are required query parameters" });
				return;
			}

			if (typeof latitude !== "string" || typeof longitude !== "string") {
				res.status(400).json({ message: "Latitude and longitude must be string values" });
				return;
			}

			// Validate latitude and longitude formats
			const latFloat = parseFloat(latitude);
			const lngFloat = parseFloat(longitude);

			if (isNaN(latFloat) || isNaN(lngFloat)) {
				res.status(400).json({ message: "Invalid latitude or longitude format" });
				return;
			}

			// Validate latitude and longitude ranges
			if (latFloat < -90 || latFloat > 90) {
				res.status(400).json({ message: "Latitude must be between -90 and 90 degrees" });
				return;
			}

			if (lngFloat < -180 || lngFloat > 180) {
				res.status(400).json({ message: "Longitude must be between -180 and 180 degrees" });
				return;
			}

			const categories = await this.categoryService.getCategoriesByCoordinates(latitude, longitude);
			sendJsonBigint(res, { categories, matchCount: categories.length });
		} catch (error) {
			console.error("Error fetching categories by coordinates:", error);
			res.status(500).json({ message: "Failed to fetch categories by coordinates" });
		}
	};
}

export default CategoryFacade;
