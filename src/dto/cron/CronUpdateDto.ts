import BaseResponseDto from "../base/BaseResponseDto";

interface CronUpdateDto extends BaseResponseDto {
	unit: string;
	interval: number;
}

export default CronUpdateDto;
