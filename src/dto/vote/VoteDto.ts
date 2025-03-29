import BaseResponseDto from "../base/BaseResponseDto";

interface VoteDto extends BaseResponseDto {
	auction_id: number;
	user_id: number;
	photo_id: number;
	status_id: number;
	transfer_amount: number;
}

export default VoteDto;
