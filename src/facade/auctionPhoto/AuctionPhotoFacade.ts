import { Request, Response } from "express";
import AuctionPhotoDto from "src/dto/auctionPhoto/AuctionPhotoDto";
import CustomError from "src/error/CustomError";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import StatusService from "src/service/status/StatusService";
import BaseValidation from "src/validation/base/BaseValidation";

class AuctionPhotoFacade {
	private statusService: StatusService;
	private auctionPhotoService: AuctionPhotoService;
	private baseValidation: BaseValidation;

	constructor() {
		this.statusService = new StatusService();
		this.auctionPhotoService = new AuctionPhotoService();
		this.baseValidation = new BaseValidation();
	}

	public async getAuctionPhotoList(_req: Request, res: Response): Promise<void> {
		const auctionStatus = await this.statusService.getStatusFromName("auction");

		// get and return auction photo list
		try {
			const auctionPhotoList: AuctionPhotoDto = await this.auctionPhotoService.getAuctionPhotoListByStatus(auctionStatus.id);
			res.status(200).json(auctionPhotoList);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async getAuctionPhotoByPhotoId(req: Request, res: Response): Promise<void> {
		let photoId: number;

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get and return auction photo
		try {
			const aucitonPhotoDto: AuctionPhotoDto = await this.auctionPhotoService.getAuctionPhotoByPhotoIdPlain(photoId);
			res.status(200).json(aucitonPhotoDto);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}
}

export default AuctionPhotoFacade;
