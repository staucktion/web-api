import BaseResponseDto from "../base/BaseResponseDto";

interface AuctionPhotoDto extends BaseResponseDto {
	photo_id: number;
	auction_id: number;
	status_id: number;
	last_bid_amount: number;
	start_time: string;
	finish_time: string;
	current_winner_order: number | null;
	winner_user_id_1: number | null;
	winner_user_id_2: number | null;
	winner_user_id_3: number | null;
	created_at: string;
	updated_at: string;
}

export default AuctionPhotoDto;
