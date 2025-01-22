import CustomError from "src/error/CustomError";

class ValidationUtil {
	public static checkObjectExistence(obj) {
		if (obj === undefined) CustomError.builder().setErrorType("Object Validation").setDetailedMessage(`Object is undefined.`).build().throwError();
		if (obj === null) CustomError.builder().setErrorType("Object Validation").setDetailedMessage(`Object is null.`).build().throwError();
		if (obj === "") CustomError.builder().setErrorType("Object Validation").setDetailedMessage(`Object is empty string.`).build().throwError();
	}

	public static checkArrayData(arr) {
		if (typeof arr !== "object") CustomError.builder().setErrorType("Array Validation").setDetailedMessage(`Parameter is not an object.`).build().throwError();
		if (!Array.isArray(arr)) CustomError.builder().setErrorType("Array Validation").setDetailedMessage(`Object is not an array.`).build().throwError();
		if (arr.length === 0) CustomError.builder().setErrorType("Data Validation").setDetailedMessage(`Array is empty.`).build().throwError();
	}

	public static checkRequiredFields(requiredFields: string[], obj) {
		const missingFields = requiredFields.filter((field) => obj[field] === undefined || obj[field] === null || obj[field] === "");

		if (missingFields.length !== 0) {
			CustomError.builder().setErrorType("Object Validation").setDetailedMessage(`Missing fields: ${missingFields}.`).build().throwError();
		}
	}

	public static compareObjectProperties(obj1: any, obj2: any, fields: string[]) {
		const unmatchedFields = fields.filter((field) => obj1[field] !== obj2[field]);

		if (unmatchedFields.length > 0) {
			CustomError.builder()
				.setErrorType("Object Comparison Validation")
				.setDetailedMessage(`Unmatched fields: ${unmatchedFields.join(", ")}`)
				.build()
				.throwError();
		}
	}

	public static validateNumericFieldsOfObject(numericFields: string[], obj) {
		const invalidFields = numericFields.filter((field) => isNaN(Number(obj[field])));

		if (invalidFields.length !== 0) {
			CustomError.builder().setErrorType("Object Validation").setDetailedMessage(`Invalid numeric fields: ${invalidFields}`).build().throwError();
		}
	}

	public static assignNumericFieldsOnObject(numericFields: string[], obj) {
		numericFields.map((field) => (obj[field] = Number(obj[field])));
	}
}

export default ValidationUtil;
