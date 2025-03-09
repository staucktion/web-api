interface CreateCategoryDto {
	name: string;
	location_id: bigint;
	address: string;
	valid_radius: number;
}

export default CreateCategoryDto;
