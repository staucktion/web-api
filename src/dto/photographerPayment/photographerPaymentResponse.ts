import BaseResponseDto from "../base/BaseResponseDto";
import StatusDto from "../status/StatusDto";

interface photographerPaymentResponse extends BaseResponseDto {
	user_id: number;
	status_id: number;
	payment_amount: number;
	status: StatusDto;
}

export default photographerPaymentResponse;
