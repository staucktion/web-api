/**
 * Data transfer object for updating an existing category
 */
interface UpdateCategoryDto {
	id: bigint;
	name?: string;
	location_id?: bigint;
	address?: string;
	valid_radius?: number;
	status_id?: number;
}

export default UpdateCategoryDto;
