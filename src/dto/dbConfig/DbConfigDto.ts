import BaseResponseDto from "../base/BaseResponseDto";

interface DbConfigDto extends BaseResponseDto {
	voter_comission_percentage: number;
	photographer_comission_percentage: number;
	photos_to_auction_percentage: number;
	is_timer_job_active: boolean;
}

export default DbConfigDto;
