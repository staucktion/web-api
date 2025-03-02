import BaseResponseDto from "../base/BaseResponseDto";

export default interface LocationDto extends BaseResponseDto {
	latitude: string;
	longitude: string;
}
