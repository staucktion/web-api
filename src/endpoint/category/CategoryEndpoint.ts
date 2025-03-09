import express, { Router } from "express";
import CategoryFacade from "src/facade/category/categoryFacade";
import { AuthMiddleware } from "src/middleware/authMiddleware";

class CategoryEndpoint {
	private categoryFacade: CategoryFacade;
	private router: Router;
	private authMiddleware: AuthMiddleware;

	constructor() {
		this.categoryFacade = new CategoryFacade();
		this.router = express.Router();
		this.authMiddleware = new AuthMiddleware();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Get all categories - public access
		this.router.get("/categories", this.categoryFacade.handleGetAllCategories);

		// Get waiting categories - authenticated access (admin)
		this.router.get("/categories/waiting", this.authMiddleware.authenticateJWT, this.categoryFacade.handleGetWaitingCategories);

		// Get categories by coordinates - public access
		// This must come before the :id route to avoid being caught by that pattern
		this.router.get("/categories/search/by-coordinates", this.categoryFacade.handleGetCategoriesByCoordinates);

		// Get category by ID - public access
		this.router.get("/categories/:id", this.categoryFacade.handleGetCategoryById);

		// Create a new category - authenticated access
		this.router.post("/categories", this.authMiddleware.authenticateJWT, this.categoryFacade.handleCreateCategory);

		// Update a category - authenticated access
		this.router.put("/categories/:id", this.authMiddleware.authenticateJWT, this.categoryFacade.handleUpdateCategory);

		// Approve/reject a category - authenticated access (admin)
		this.router.put("/categories/:id/status", this.authMiddleware.authenticateJWT, this.categoryFacade.handleApproveRejectCategory);

		// Delete a category - authenticated access
		this.router.delete("/categories/:id", this.authMiddleware.authenticateJWT, this.categoryFacade.handleDeleteCategory);

		// Get categories by location ID - public access
		this.router.get("/locations/:locationId/categories", this.categoryFacade.handleGetCategoriesByLocationId);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default CategoryEndpoint;
