import { Request } from "express";
import CustomError from "src/error/CustomError";
import CreateCategoryDto from "src/dto/category/CreateCategoryDto";
import UpdateCategoryDto from "src/dto/category/UpdateCategoryDto";

class CategoryValidation {
	validateCreateCategoryRequest(req: Request): CreateCategoryDto {
		// Check if request body exists
		if (!req.body) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Request body is required").build().throwError();
		}

		const { name, location_id, address, valid_radius } = req.body;

		// Validate required fields
		if (!name) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Category name is required").build().throwError();
		}

		if (!location_id) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Location ID is required").build().throwError();
		}

		if (!address) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Address is required").build().throwError();
		}

		// Validate data types
		const locationId = BigInt(location_id);
		if (isNaN(Number(location_id))) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Location ID must be a number").build().throwError();
		}

		let validRadius = 0;
		if (valid_radius) {
			validRadius = Number(valid_radius);
			if (isNaN(validRadius)) {
				CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Valid radius must be a number").build().throwError();
			}
		}

		// Create and return the DTO
		return {
			name,
			location_id: locationId,
			address,
			valid_radius: validRadius,
		};
	}

	validateUpdateCategoryRequest(req: Request): UpdateCategoryDto {
		// Check if request body exists
		if (!req.body) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Request body is required").build().throwError();
		}

		// Extract category ID from URL parameters
		const categoryId = req.params.id;
		if (!categoryId) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Category ID is required").build().throwError();
		}

		// Parse category ID to bigint
		const id = BigInt(categoryId);
		if (isNaN(Number(categoryId))) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Category ID must be a number").build().throwError();
		}

		const { name, location_id, address, valid_radius, status_id } = req.body;

		// Ensure at least one field is provided for update
		if (!name && !location_id && !address && valid_radius === undefined && status_id === undefined) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("At least one field must be provided for update").build().throwError();
		}

		// Create the update DTO
		const updateDto: UpdateCategoryDto = { id };

		// Add optional fields if provided
		if (name !== undefined) {
			updateDto.name = name;
		}

		if (location_id !== undefined) {
			if (isNaN(Number(location_id))) {
				CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Location ID must be a number").build().throwError();
			}
			updateDto.location_id = BigInt(location_id);
		}

		if (address !== undefined) {
			updateDto.address = address;
		}

		if (valid_radius !== undefined) {
			const validRadius = Number(valid_radius);
			if (isNaN(validRadius)) {
				CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Valid radius must be a number").build().throwError();
			}
			updateDto.valid_radius = validRadius;
		}

		if (status_id !== undefined) {
			const statusId = Number(status_id);
			if (isNaN(statusId)) {
				CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Status ID must be a number").build().throwError();
			}
			updateDto.status_id = statusId;
		}

		return updateDto;
	}

	validateApproveRejectRequest(req: Request): { categoryId: bigint; action: "approve" | "reject"; reason?: string } {
		// Extract categoryId from URL parameters
		const categoryId = req.params.id;
		if (!categoryId) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Category ID is required").build().throwError();
		}

		// Check if request body exists
		if (!req.body) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Request body is required").build().throwError();
		}

		// Extract action from request body
		const { action, reason } = req.body;
		if (!action) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Action is required").build().throwError();
		}

		// Validate action
		if (action !== "approve" && action !== "reject") {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Action must be either 'approve' or 'reject'").build().throwError();
		}

		// If action is reject, reason is required
		if (action === "reject" && !reason) {
			CustomError.builder().setErrorType("Validation Error").setStatusCode(400).setMessage("Reason is required when rejecting a category").build().throwError();
		}

		return {
			categoryId: BigInt(categoryId),
			action,
			reason,
		};
	}

	validateCoordinates(req: Request): { latitude: number; longitude: number } {
		const { latitude, longitude } = req.query;

		if (!latitude || !longitude) {
			CustomError.builder().setMessage("Missing required query parameters: latitude and longitude").setErrorType("Bad Request").setStatusCode(400).build().throwError();
			return;
		}

		if (typeof latitude !== "string" || typeof longitude !== "string") {
			CustomError.builder().setMessage("Latitude and longitude must be string values").setErrorType("Bad Request").setStatusCode(400).build().throwError();
			return;
		}

		const latFloat = parseFloat(latitude as string);
		const lngFloat = parseFloat(longitude as string);

		if (isNaN(latFloat) || isNaN(lngFloat)) {
			CustomError.builder().setMessage("Invalid latitude or longitude format").setErrorType("Bad Request").setStatusCode(400).build().throwError();
			return;
		}

		// Validate latitude and longitude ranges
		if (latFloat < -90 || latFloat > 90) {
			CustomError.builder().setMessage("Latitude must be between -90 and 90 degrees").setErrorType("Bad Request").setStatusCode(400).build().throwError();
			return;
		}

		if (lngFloat < -180 || lngFloat > 180) {
			CustomError.builder().setMessage("Longitude must be between -180 and 180 degrees").setErrorType("Bad Request").setStatusCode(400).build().throwError();
			return;
		}

		return {
			latitude: latFloat,
			longitude: lngFloat,
		};
	}
}

export default CategoryValidation;
