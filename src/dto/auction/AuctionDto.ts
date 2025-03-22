import BaseResponseDto from "../base/BaseResponseDto";
import StatusDto from "../status/StatusDto";

interface AuctionDto extends BaseResponseDto {
	category_id: number;
	status: StatusDto;
	start_time: Date;
	finish_time: Date;
	is_deleted: boolean;
	created_at: Date;
	updated_at: Date;
}

export default AuctionDto;
