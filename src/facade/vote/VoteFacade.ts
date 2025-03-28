import { Request, Response } from "express";
import CustomError from "src/error/CustomError";
import AuctionService from "src/service/auction/AuctionService";
import PhotoService from "src/service/photo/photoService";
import StatusService from "src/service/status/StatusService";
import VoteService from "src/service/vote/VoteService";
import BaseValidation from "src/validation/base/BaseValidation";

class VoteFacade {
	private voteService: VoteService;
	private baseValidation: BaseValidation;
	private statusService: StatusService;
	private auctionService: AuctionService;
	private photoService: PhotoService;

	constructor() {
		this.voteService = new VoteService();
		this.baseValidation = new BaseValidation();
		this.auctionService = new AuctionService();
		this.statusService = new StatusService();
		this.statusService = new StatusService();
		this.photoService = new PhotoService();
	}

	public async vote(req: Request, res: Response): Promise<void> {
		let photoId: number;
		let photo;
		let auction;
		let filteredUserVoteList;

		// get valid param from request
		try {
			({ photoId } = await this.baseValidation.params(req, ["photoId"]));
			photoId = Number(photoId);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get photo
		try {
			photo = await this.photoService.getPhotoById(photoId);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// reject if photo not found
		if (!photo) {
			res.status(400).json({ message: "Photo not found" });
			return;
		}

		// reject if user try to vote own photo
		if (req.user.id === photo.user_id) {
			res.status(400).json({ message: "You cannot vote to your own photo" });
			return;
		}

		// get auction
		try {
			auction = await this.auctionService.getAuctionById(photo.auction_id);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// check auction status
		if (auction?.status?.status !== "vote" || photo?.status?.status !== "vote") {
			res.status(400).json({ message: "Photo is not included in available auction" });
			return;
		}

		// get filtered user votes
		try {
			const userVoteList = await this.voteService.getVoteListByUserId(req.user.id);
			filteredUserVoteList = userVoteList.filter((vote) => vote.auction_id == auction.id);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// reject if vote count is reach 10
		if (filteredUserVoteList.length >= 10) {
			res.status(400).json({ message: "Vote count for specific auction has reached 10 already" });
			return;
		}

		// reject if photo is already voted by user
		if (filteredUserVoteList?.some((vote) => vote.photo_id === photoId)) {
			res.status(400).json({ message: "You have already voted that photo" });
			return;
		}

		// update vote count of the photo
		try {
			const dataToUpdatePhoto = { ...photo, vote_count: photo.vote_count + 1 };
			await this.photoService.updatePhoto(photoId, dataToUpdatePhoto);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// add vote record
		try {
			const voteStatus = await this.statusService.getStatusFromName("vote");
			const data = { user_id: req.user.id, photo_id: photoId, status_id: voteStatus.id, auction_id: auction.id };
			await this.voteService.insertNewVote(data);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		res.status(204).send();
	}

	public async getUserVotes(req: Request, res: Response): Promise<void> {
		try {
			const userVoteList = await this.voteService.getVoteListByUserId(req.user.id);
			res.status(200).json(userVoteList);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}
}

export default VoteFacade;
