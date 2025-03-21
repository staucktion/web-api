import BaseResponseDto from "../base/BaseResponseDto";

interface PurchasedPhotoDto extends BaseResponseDto {
	photo_id: number;
	user_id: number;
	payment_amount: number;
}

export default PurchasedPhotoDto;
