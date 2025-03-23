import { Request, Response } from "express";
import AuctionPhotoDto from "src/dto/auctionPhoto/AuctionPhotoDto";
import CustomError from "src/error/CustomError";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import StatusService from "src/service/status/StatusService";

class AuctionPhotoFacade {
	private statusService: StatusService;
	private auctionPhotoService: AuctionPhotoService;

	constructor() {
		this.statusService = new StatusService();
		this.auctionPhotoService = new AuctionPhotoService();
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
}

export default AuctionPhotoFacade;
