import { Request, Response } from "express";
import ProfitResponseDto from "src/dto/profit/ProfitResponseDto";
import VoteDto from "src/dto/vote/VoteDto";
import CustomError from "src/error/CustomError";
import PhotographerPaymentService from "src/service/photographerPayment/PhotographerPaymentService";
import VoteService from "src/service/vote/VoteService";
import { StatusEnum } from "src/types/statusEnum";

class ProfitFacade {
	private voteService: VoteService;
	private photographerPaymentService: PhotographerPaymentService;

	constructor() {
		this.voteService = new VoteService();
		this.photographerPaymentService = new PhotographerPaymentService();
	}

	public async getOwnProfits(req: Request, res: Response): Promise<void> {
		let voteList: VoteDto[];
		let photographerPaymentList;
		let profitAmount: number = 0;

		// get vote list
		try {
			voteList = await this.voteService.getVoteListByUserIdAndStatusId(req.user.id, StatusEnum.WAIT);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get photographer payments
		try {
			photographerPaymentList = await this.photographerPaymentService.getPhotographerPaymentList(req.user.id, StatusEnum.WAIT);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// sum vote profits
		for (const vote of voteList) profitAmount += vote.transfer_amount;

		// sum photographer payment profits
		for (const photographerPayment of photographerPaymentList) profitAmount += photographerPayment.payment_amount;

		const responseDto: ProfitResponseDto = { profitAmount };
		res.status(200).json(responseDto);
		return;
	}
}

export default ProfitFacade;
