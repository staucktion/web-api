import BaseResponseDto from "../base/BaseResponseDto";

interface CronDto extends BaseResponseDto {
	unit: string;
	interval: number;
	lastTriggerTime: Date;
}

export default CronDto;
