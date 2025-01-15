import CustomError from "src/error/CustomError";

class ValidationUtil {
	public static checkObjectExistence(obj) {
		if (obj === undefined) CustomError.builder().setErrorType("Object Validation").setExternalMessage(`Object is undefined.`).build().throwError();
		if (obj === null) CustomError.builder().setErrorType("Object Validation").setExternalMessage(`Object is null.`).build().throwError();
		if (obj === "") CustomError.builder().setErrorType("Object Validation").setExternalMessage(`Object is empty string.`).build().throwError();
	}

	public static checkArrayData(arr) {
		if (typeof arr !== "object") CustomError.builder().setErrorType("Array Validation").setExternalMessage(`Parameter is not an object.`).build().throwError();
		if (!Array.isArray(arr)) CustomError.builder().setErrorType("Array Validation").setExternalMessage(`Object is not an array.`).build().throwError();
		if (arr.length === 0) CustomError.builder().setErrorType("Data Validation").setExternalMessage(`Array is empty.`).build().throwError();
	}

	public static checkRequiredFields(requiredFields: string[], obj) {
		const missingFields = requiredFields.filter((field) => obj[field] === undefined || obj[field] === null || obj[field] === "");

		if (missingFields.length !== 0) {
			CustomError.builder().setErrorType("Object Validation").setExternalMessage(`Missing fields: ${missingFields}.`).build().throwError();
		}
	}

	public static validateNumericFieldsOfObject(numericFields: string[], obj) {
		const invalidFields = numericFields.filter((field) => isNaN(Number(obj[field])));

		if (invalidFields.length !== 0) {
			CustomError.builder().setErrorType("Object Validation").setExternalMessage(`Invalid numeric fields: ${invalidFields}`).build().throwError();
		}
	}

	public static assignNumericFieldsOnObject(numericFields: string[], obj) {
		numericFields.map((field) => (obj[field] = Number(obj[field])));
	}
}

export default ValidationUtil;
