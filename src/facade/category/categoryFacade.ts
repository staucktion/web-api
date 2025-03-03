import { Request, Response } from "express";
import CategoryDto from "src/dto/category/CategoryDto";
import CategoryService from "src/service/category/categoryService";
import sendJsonBigint from "src/util/sendJsonBigint";
import CustomError from "src/error/CustomError";
import CreateCategoryDto from "src/dto/category/CreateCategoryDto";
import UpdateCategoryDto from "src/dto/category/UpdateCategoryDto";
import CategoryValidation from "src/validation/category/CategoryValidation";
import { StatusEnum } from "src/types/statusEnum";

class CategoryFacade {
	private categoryService: CategoryService;
	private categoryValidation: CategoryValidation;

	constructor() {
		this.categoryService = new CategoryService();
		this.categoryValidation = new CategoryValidation();
	}

	public handleGetAllCategories = async (_req: Request, res: Response): Promise<void> => {
		try {
			// Only show APPROVED categories in the general list
			const categories = await this.categoryService.getAllCategoriesByStatus(StatusEnum.APPROVE);
			sendJsonBigint(res, categories, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleGetWaitingCategories = async (_req: Request, res: Response): Promise<void> => {
		try {
			const waitingCategories = await this.categoryService.getAllCategoriesByStatus(StatusEnum.WAIT);
			sendJsonBigint(res, waitingCategories, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleApproveRejectCategory = async (req: Request, res: Response): Promise<void> => {
		// Check authentication
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			// Validate request
			const { categoryId, action, reason } = await this.categoryValidation.validateApproveRejectRequest(req);

			// Determine new status based on action
			const newStatus = action === "approve" ? StatusEnum.APPROVE : StatusEnum.REJECT;

			// Update category status
			const updatedCategory = await this.categoryService.updateCategoryStatus(categoryId, newStatus, reason);

			sendJsonBigint(
				res,
				{
					message: `Category has been ${action === "approve" ? "approved" : "rejected"} successfully`,
					category: updatedCategory,
				},
				200
			);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleGetCategoryById = async (req: Request, res: Response): Promise<void> => {
		try {
			const categoryId = parseInt(req.params.id);
			const category = await this.categoryService.getCategoryById(categoryId);
			sendJsonBigint(res, category, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleCreateCategory = async (req: Request, res: Response): Promise<void> => {
		// Check if user is authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			// Validate and create category DTO
			const createCategoryDto: CreateCategoryDto = await this.categoryValidation.validateCreateCategoryRequest(req);

			// Create category
			const createdCategory = await this.categoryService.createCategory(createCategoryDto);
			sendJsonBigint(res, createdCategory, 201);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleUpdateCategory = async (req: Request, res: Response): Promise<void> => {
		// Check if user is authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			const categoryId = parseInt(req.params.id);
			const updateCategoryDto: UpdateCategoryDto = await this.categoryValidation.validateUpdateCategoryRequest(req);
			const updatedCategory = await this.categoryService.updateCategory(categoryId, updateCategoryDto);
			sendJsonBigint(res, updatedCategory, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleDeleteCategory = async (req: Request, res: Response): Promise<void> => {
		// Check if user is authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			const categoryId = parseInt(req.params.id);
			await this.categoryService.deleteCategory(categoryId);
			res.json({ message: "Category deleted successfully" });
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleGetCategoriesByLocationId = async (req: Request, res: Response): Promise<void> => {
		try {
			const locationId = parseInt(req.params.locationId);
			// Only show APPROVED categories for this location
			const categories = await this.categoryService.getCategoriesByLocationIdAndStatus(locationId, StatusEnum.APPROVE);
			sendJsonBigint(res, categories, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};

	public handleGetCategoriesByCoordinates = async (req: Request, res: Response): Promise<void> => {
		try {
			const validatedCoordinates = this.categoryValidation.validateCoordinates(req);

			// Only show APPROVED categories for this coordinate search
			const categories = await this.categoryService.getCategoriesByCoordinatesAndStatus(validatedCoordinates.latitude, validatedCoordinates.longitude, StatusEnum.APPROVE);
			sendJsonBigint(res, categories, 200);
		} catch (error) {
			CustomError.handleError(res, error);
		}
	};
}

export default CategoryFacade;
