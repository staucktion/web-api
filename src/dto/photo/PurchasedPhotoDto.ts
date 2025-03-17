import BaseResponseDto from "../base/BaseResponseDto";

export default interface PurchasedPhotoDto extends BaseResponseDto {
	photo_id: number;
	user_id: number;
	payment_amount: number;
}
