import { Request, Response } from "express";
import BidDto from "src/dto/bid/BidDto";
import BidResponseDto from "src/dto/bid/BidResponseDto";
import CustomError from "src/error/CustomError";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import BidService from "src/service/bid/BidService";
import UserService from "src/service/user/userService";
import handlePrismaType from "src/util/handlePrismaType";
import BaseValidation from "src/validation/base/BaseValidation";
import BidValidation from "src/validation/bid/BidValidation";
import WebSocketManager from "src/websocket/WebSocketManager";

class BidFacade {
	private bidService: BidService;
	private bidValidation: BidValidation;
	private baseValidation: BaseValidation;
	private userService: UserService;
	private auctionPhotoService: AuctionPhotoService;

	constructor(webSocketManager: WebSocketManager) {
		this.bidService = new BidService(webSocketManager);
		this.bidValidation = new BidValidation();
		this.baseValidation = new BaseValidation();
		this.userService = new UserService();
		this.auctionPhotoService = new AuctionPhotoService();
	}

	public async bid(req: Request, res: Response): Promise<void> {
		let bidDto: BidDto;
		let photoId: number;
		let user;
		let auctionPhoto;

		// get valid body from request
		try {
			bidDto = await this.bidValidation.bid(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get user
		try {
			user = await this.userService.getUserById(handlePrismaType(req.user.id));
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// expect user status to be active
		if (user.status?.status !== "active") {
			res.status(400).json({ message: "need account activation with provision validation" });
			return;
		}

		// get auction photo
		try {
			auctionPhoto = await this.auctionPhotoService.getAuctionPhotoByPhotoId(photoId);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// expect there is a acution for that photo and status is 'auction'
		if (!(auctionPhoto?.status?.status === "auction")) {
			res.status(400).json({ message: `photo with id ${photoId} is not on auction` });
			return;
		}

		// expect requested photo is not belong to user who make request
		if (user.id === auctionPhoto.photo.user_id) {
			res.status(400).json({ message: `photo with id ${photoId} is belong to you` });
			return;
		}

		// expect new bid amount is higher than the last bid amount
		if (auctionPhoto.last_bid_amount >= bidDto.bidAmount) {
			res.status(400).json({ message: `need higher bid amount from last bid amount. Last bid amount: ${auctionPhoto.last_bid_amount}, current bid amount: ${bidDto.bidAmount}` });
			return;
		}

		// update auctionphoto table
		try {
			const updateData = { ...auctionPhoto, last_bid_amount: bidDto.bidAmount };
			await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, updateData);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// add bid table
		try {
			const createData = {
				bid_amount: bidDto.bidAmount,
				user_id: user.id,
				auction_photo_id: auctionPhoto.id,
			};
			await this.bidService.insertNewBid(createData);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}

	public async getBidsByAuctionPhotoId(req: Request, res: Response): Promise<void> {
		let auctionPhotoId: number;

		// get valid param from request
		try {
			({ auctionPhotoId } = await this.baseValidation.params(req, ["auctionPhotoId"]));
			if (isNaN(auctionPhotoId)) throw new Error("Invalid auctionPhotoId: It must be a number.");
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get and return bids
		try {
			const bidList: BidResponseDto = await this.bidService.getBidsByAuctionPhotoIdPlain(auctionPhotoId);
			res.status(200).json(bidList);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}
}

export default BidFacade;
