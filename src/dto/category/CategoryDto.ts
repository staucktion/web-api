import BaseResponseDto from "../base/BaseResponseDto";
import LocationDto from "../location/LocationDto";

export default interface CategoryDto extends BaseResponseDto {
	name: string;
	address: string;
	valid_radius: number;
	location: LocationDto;
	status: string;
	auction_list: any[];
	photo_list: any[];
}
