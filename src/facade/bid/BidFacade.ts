import { Request, Response } from "express";
import BidDto from "src/dto/bid/BidDto";
import CustomError from "src/error/CustomError";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import BankService from "src/service/bank/BankService";
import BidService from "src/service/bid/BidService";
import StatusService from "src/service/status/StatusService";
import UserService from "src/service/user/userService";
import handlePrismaType from "src/util/handlePrismaType";
import BaseValidation from "src/validation/base/BaseValidation";
import BidValidation from "src/validation/bid/BidValidation";

class BidFacade {
	private bankService: BankService;
	private bidService: BidService;
	private bidValidation: BidValidation;
	private baseValidation: BaseValidation;
	private statusService: StatusService;
	private userService: UserService;
	private auctionPhotoService: AuctionPhotoService;

	constructor() {
		this.bankService = new BankService();
		this.bidService = new BidService();
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
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
		} catch (error: any) {
			CustomError.handleError(res, error);
			return;
		}

		// get user
		try {
			user = await this.userService.getUserById(handlePrismaType(req.user.id));
		} catch (error: any) {
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
		} catch (error: any) {
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

		res.status(204).send();
	}
}

export default BidFacade;
