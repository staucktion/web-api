/**
 * Data transfer object for creating a new category
 */
interface CreateCategoryDto {
	name: string;
	location_id: bigint;
	address: string;
	valid_radius: number;
}

export default CreateCategoryDto;
