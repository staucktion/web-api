import BaseResponseDto from "../base/BaseResponseDto";

interface CronDto extends BaseResponseDto {
	name: string | undefined;
	unit: string | undefined;
	interval: number | undefined;
	last_trigger_time: Date | null | undefined;
	next_trigger_time: Date | null | undefined;
}

export default CronDto;
