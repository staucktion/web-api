import express, { Router } from "express";
import CategoryFacade from "src/facade/category/categoryFacade";

class CategoryEndpoint {
	private categoryFacade: CategoryFacade;
	private router: Router;

	constructor() {
		this.categoryFacade = new CategoryFacade();
		this.router = express.Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		// Get all categories
		this.router.get("/categories", this.categoryFacade.handleGetAllCategories);

		// Get categories by coordinates (latitude and longitude)
		// This must come before the :id route to avoid being caught by that pattern
		this.router.get("/categories/search/by-coordinates", this.categoryFacade.handleGetCategoriesByCoordinates);

		// Get category by ID
		this.router.get("/categories/:id", this.categoryFacade.handleGetCategoryById);

		// Create a new category
		this.router.post("/categories", this.categoryFacade.handleCreateCategory);

		// Update a category
		this.router.put("/categories/:id", this.categoryFacade.handleUpdateCategory);

		// Delete a category
		this.router.delete("/categories/:id", this.categoryFacade.handleDeleteCategory);

		// Get categories by location ID
		this.router.get("/locations/:locationId/categories", this.categoryFacade.handleGetCategoriesByLocationId);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default CategoryEndpoint;
