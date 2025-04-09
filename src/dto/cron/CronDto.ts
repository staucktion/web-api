import BaseResponseDto from "../base/BaseResponseDto";

interface CronDto extends BaseResponseDto {
	name: string;
	unit: string;
	interval: number;
	last_trigger_time: Date;
	next_trigger_time: Date;
}

export default CronDto;
