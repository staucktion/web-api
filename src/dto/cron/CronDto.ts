import BaseResponseDto from "../base/BaseResponseDto";

export default interface CronDto extends BaseResponseDto {
	unit: string;
	interval: number;
	lastTriggerTime: Date;
}
