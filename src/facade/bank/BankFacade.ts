import { Request, Response } from "express";
import Config from "src/config/Config";
import CardDto from "src/dto/bank/CardDto";
import CustomError from "src/error/CustomError";
import AuctionService from "src/service/auction/AuctionService";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import BankService from "src/service/bank/BankService";
import PhotoService from "src/service/photo/photoService";
import PhotographerPaymentService from "src/service/photographerPayment/PhotographerPaymentService";
import PurchasedPhotoService from "src/service/purchasedPhoto/PurchasedPhotoService";
import StatusService from "src/service/status/StatusService";
import UserService from "src/service/user/userService";
import VoteService from "src/service/vote/VoteService";
import BankValidation from "src/validation/bank/BankValidation";
import BaseValidation from "src/validation/base/BaseValidation";

class BankFacade {
	private bankService: BankService;
	private bankValidation: BankValidation;
	private userService: UserService;
	private statusService: StatusService;
	private baseValidation: BaseValidation;
	private photoService: PhotoService;
	private auctionPhotoService: AuctionPhotoService;
	private purchasedPhotoService: PurchasedPhotoService;
	private voteService: VoteService;
	private photographerPaymentService: PhotographerPaymentService;
	private auctionService: AuctionService;

	constructor() {
		this.bankService = new BankService();
		this.bankValidation = new BankValidation();
		this.userService = new UserService();
		this.statusService = new StatusService();
		this.baseValidation = new BaseValidation();
		this.photoService = new PhotoService();
		this.auctionPhotoService = new AuctionPhotoService();
		this.purchasedPhotoService = new PurchasedPhotoService();
		this.voteService = new VoteService();
		this.photographerPaymentService = new PhotographerPaymentService();
		this.auctionService = new AuctionService();
	}

	public async approveUser(req: Request, res: Response): Promise<void> {
		let cardDto: CardDto;
		let banUser: boolean = false;

		// get valid body from request
		try {
			cardDto = await this.bankValidation.validateBankCredentials(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// add provision
		try {
			await this.bankService.addProvision({ ...cardDto, provision: Config.provisionAmount });
		} catch (error: any) {
			if (error.message === "Cannot perform bank api operation. Balance is not sufficient for provision.") banUser = true;
		}

		// ban user
		if (banUser)
			try {
				const bannedStatus = await this.statusService.getStatusFromName("banned");
				const dataToUpdateUser = { status_id: bannedStatus.id };
				await this.userService.updateUser(req.user.id, dataToUpdateUser);
				res.status(400).json({ message: "provision is not enough, user banned." });
				return;
			} catch (error: any) {
				CustomError.handleError(res, error);
				return;
			}

		// remove provision
		try {
			await this.bankService.removeProvision({ ...cardDto, provision: Config.provisionAmount });
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// activate user
		try {
			const activeStatus = await this.statusService.getStatusFromName("active");
			const dataToUpdateUser = { status_id: activeStatus.id };
			await this.userService.updateUser(req.user.id, dataToUpdateUser);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}

	public async purchasePhotoFromAuction(req: Request, res: Response): Promise<void> {
		let photoId: number;
		let cardDto: CardDto;
		let photo;
		let auctionPhoto;

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
			photoId = Number(photoId);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get valid body from request
		try {
			cardDto = await this.bankValidation.validateBankCredentials(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get photo
		try {
			photo = await this.photoService.getPhotoById(photoId);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get auction photo
		try {
			auctionPhoto = await this.auctionPhotoService.getAuctionPhotoByPhotoId(photoId);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// check photo status
		if (photo?.status?.status !== "wait_purchase_after_auction") {
			res.status(400).json({ message: `photo is not available to purchase after auction` });
			return;
		}

		// reject if user is not current winner
		if (req.user.id !== auctionPhoto[`winner_user_id_${auctionPhoto.current_winner_order}`]) {
			res.status(400).json({ message: `user is not current winner` });
			return;
		}

		// transfer last_bid_amount to staucktion bank account
		try {
			const data = {
				senderCardNumber: cardDto.cardNumber,
				senderExpirationDate: cardDto.expirationDate,
				senderCvv: cardDto.cvv,
				targetCardNumber: Config.stauctionBankCredentials.cardNumber,
				amount: auctionPhoto.last_bid_amount,
				description: `User with id ${req.user.id} win auction with id ${auctionPhoto.auction_id} and pay ${auctionPhoto.last_bid_amount}`,
			};
			await this.bankService.transfer(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// add record to purchased photo
		try {
			const data = {
				photo_id: photoId,
				user_id: req.user.id,
				payment_amount: auctionPhoto.last_bid_amount,
			};
			await this.purchasedPhotoService.insertNewPurchasedPhoto(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// calculate amount to distribute voters
		const paymentToVoter = auctionPhoto.last_bid_amount / (10 * photo.vote_list.length);

		// update votes
		const waitStatus = await this.statusService.getStatusFromName("wait");
		for (const vote of photo.vote_list) {
			try {
				const data = { ...vote, status_id: waitStatus.id, transfer_amount: paymentToVoter };
				await this.voteService.updateVote(vote.id, data);
			} catch (error: any) {
				CustomError.handleError(res, error);
				return;
			}
		}

		// calculate amount to pay photographer
		const paymentToPhotographer = (auctionPhoto.last_bid_amount * 8) / 10;

		// add record to photographer payment
		try {
			const data = { user_id: req.user.id, status_id: waitStatus.id, payment_amount: paymentToPhotographer };
			await this.photographerPaymentService.insertNewPhotographerPayment(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// update auction, auction photo and photo
		const soldStatus = await this.statusService.getStatusFromName("sold");
		const finishStatus = await this.statusService.getStatusFromName("finish");
		try {
			const data = { ...auctionPhoto, status_id: finishStatus.id };
			await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}
		try {
			const data = { ...auctionPhoto.auction, status_id: finishStatus.id };
			await this.auctionService.updateAuction(auctionPhoto.auction.id, data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}
		try {
			const data = { ...photo, status_id: soldStatus.id };
			await this.photoService.updatePhoto(photoId, data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}

	public async purchasePhotoNow(req: Request, res: Response): Promise<void> {
		let photoId: number;
		let cardDto: CardDto;
		let photo;

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
			photoId = Number(photoId);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get valid body from request
		try {
			cardDto = await this.bankValidation.validateBankCredentials(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get photo
		try {
			photo = await this.photoService.getPhotoById(photoId);

			if (!photo) {
				res.status(400).json({ message: `Photo not found` });
				return;
			}
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		const soldStatus = await this.statusService.getStatusFromName("sold");

		if (photo.status.status === soldStatus.status) {
			res.status(400).json({ message: `Photo is already sold` });
			return;
		}

		// check photo status
		if (photo?.status?.status !== "purchasable" || photo.purchase_now_price === null || photo.is_auctionable) {
			res.status(400).json({ message: `Photo is not for sale` });
			return;
		}

		// transfer purchase_now_price to staucktion bank account
		try {
			const data = {
				senderCardNumber: cardDto.cardNumber,
				senderExpirationDate: cardDto.expirationDate,
				senderCvv: cardDto.cvv,
				targetCardNumber: Config.stauctionBankCredentials.cardNumber,
				amount: photo.purchase_now_price,
				description: `User #${req.user.id} has used purchase now feature on photo #${photo.id} and paid ${photo.purchase_now_price}`,
			};
			await this.bankService.transfer(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// add record to purchased photo
		try {
			const data = {
				photo_id: photoId,
				user_id: req.user.id,
				payment_amount: photo.purchase_now_price,
			};
			await this.purchasedPhotoService.insertNewPurchasedPhoto(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		const waitStatus = await this.statusService.getStatusFromName("wait");

		// calculate amount to pay photographer
		const paymentToPhotographer = (photo.purchase_now_price * 9) / 10;

		// add record to photographer payment
		try {
			const data = { user_id: req.user.id, status_id: waitStatus.id, payment_amount: paymentToPhotographer };
			await this.photographerPaymentService.insertNewPhotographerPayment(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// update photo
		try {
			const data = { ...photo, status_id: soldStatus.id, purchased_at: new Date() };
			await this.photoService.updatePhoto(photoId, data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}

	public async withdrawProfit(req: Request, res: Response): Promise<void> {
		let voteList;
		let photographerPaymentList;
		let totalProfit = 0;
		let cardDto: CardDto;

		// get valid body from request
		try {
			cardDto = await this.bankValidation.validateBankCredentials(req);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get vote list
		try {
			const voteListTmp = await this.voteService.getVoteListByUserId(req.user.id);
			voteList = voteListTmp.filter((vote) => vote.status.status === "wait");
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get photographer payments
		try {
			const photographerPaymentListTmp = await this.photographerPaymentService.getPhotographerPaymentList();
			photographerPaymentList = photographerPaymentListTmp.filter((instance) => instance.status.status === "wait" && instance.user_id === req.user.id);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// sum vote profits and update
		const finishStatus = await this.statusService.getStatusFromName("finish");
		for (const vote of voteList) {
			totalProfit += vote.transfer_amount;

			try {
				const data = { ...vote, status_id: finishStatus.id };
				await this.voteService.updateVote(vote.id, data);
			} catch (error: any) {
				CustomError.handleError(res, error);
				return;
			}
		}

		// sum photographer paymnet profits and update
		for (const photographerPayment of photographerPaymentList) {
			totalProfit += photographerPayment.payment_amount;

			try {
				const data = { ...photographerPayment, status_id: finishStatus.id };
				await this.photographerPaymentService.updatePhotographerPayment(photographerPayment.id, data);
			} catch (error: any) {
				CustomError.handleError(res, error);
				return;
			}
		}

		// transfer profit to specified bank account
		try {
			const data = {
				senderCardNumber: Config.stauctionBankCredentials.cardNumber,
				senderExpirationDate: Config.stauctionBankCredentials.expirationDate,
				senderCvv: Config.stauctionBankCredentials.cvv,
				targetCardNumber: cardDto.cardNumber,
				amount: totalProfit,
				description: `User with id ${req.user.id} make total ${totalProfit} profit. Staucktion provide that amount.`,
			};
			await this.bankService.transfer(data);
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(200).json({ message: `User with id ${req.user.id} make total ${totalProfit} profit. Staucktion provide that amount.` });
	}
}

export default BankFacade;
