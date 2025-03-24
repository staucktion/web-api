import BaseResponseDto from "../base/BaseResponseDto";

interface BidResponseDto extends BaseResponseDto {
	bid_amount: number;
	user_id: number;
	auction_photo_id: number;
	created_at: string;
}

export default BidResponseDto;
