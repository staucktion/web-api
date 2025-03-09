import AuctionService from "src/service/auction/AuctionService";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import BidService from "src/service/bid/BidService";
import CategoryService from "src/service/category/categoryService";
import PhotoService from "src/service/photo/photoService";
import StatusService from "src/service/status/StatusService";
import TimerService from "src/service/timer/TimerService";

class TimerFacade {
	private timerService: TimerService;
	private categoryService: CategoryService;
	private auctionService: AuctionService;
	private statusService: StatusService;
	private photoService: PhotoService;
	private auctionPhotoService: AuctionPhotoService;
	private bidService: BidService;

	constructor() {
		this.timerService = new TimerService();
		this.categoryService = new CategoryService();
		this.auctionService = new AuctionService();
		this.statusService = new StatusService();
		this.photoService = new PhotoService();
		this.auctionPhotoService = new AuctionPhotoService();
		this.bidService = new BidService();
	}

	public async cronJob() {
		console.log("[INFO] 🕑 Job is running at:", new Date().toISOString());
		this.timerService.saveLastTriggerTimeToDb();

		const categoryList: any = await this.categoryService.getAllCategories();

		const waitPurchaseStatus = await this.statusService.getStatusFromName("wait_purchase_after_auction");
		const voteStatus = await this.statusService.getStatusFromName("vote");
		const auctionStatus = await this.statusService.getStatusFromName("auction");
		const purchasableStatus = await this.statusService.getStatusFromName("purchasable");
		const finishStatus = await this.statusService.getStatusFromName("finish");

		for (const category of categoryList) {
			// console.log(JSON.stringify(category, null, 2));

			if (category.status?.status === "approve") {
				// console.log("category");
				// console.log(JSON.stringify(category, null, 2));

				// creating new auction with vote status
				if (
					(!category.auction_list?.length || category.auction_list.every((auction) => auction.status?.status === "finish")) &&
					category.photo_list?.some((photo) => photo.is_auctionable === true)
				) {
					console.log("auction decision: create new auction");
					const createdAuction = await this.auctionService.insertNewAuction(category.id);

					for (const photo of category.photo_list) {
						if (photo.status.status === "approve" && photo.is_auctionable === true) {
							const dataToUpdatePhoto = { ...photo, auction_id: createdAuction.id, status_id: voteStatus.id };
							await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
						}
					}
				}

				// change auction status from 'vote' to 'auction'
				else if (category.auction_list?.some((auction) => auction.status?.status === "vote")) {
					console.log("auction decision: change 'vote' status to 'auction'");

					for (const auction of category.auction_list) {
						// console.log("auction");
						// console.log(JSON.stringify(auction, null, 2));

						if (auction.status?.status === "vote") {
							const dataToUpdateAuction = { ...auction, status_id: auctionStatus.id };
							await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);

							const topPhotoCountWillBeAuctioned = Math.ceil(auction.photo_list.length / 10);
							auction.photo_list.sort((a, b) => b.vote_count - a.vote_count);

							for (const [index, photo] of auction.photo_list.entries()) {
								if (index < topPhotoCountWillBeAuctioned) {
									// console.log(`photo will be auctioned: `, photo);

									const dataToUpdatePhoto = { ...photo, status_id: auctionStatus.id };
									await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
									await this.auctionPhotoService.insertNewPhotoAuction(auction.id, photo.id, auctionStatus.id);
								} else {
									// console.log(`photo will NOT be auctioned: `, photo);

									const dataToUpdatePhoto = { ...photo, status_id: purchasableStatus.id };
									await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
								}
							}
						}
					}
				}

				// change auction status from 'auction' to 'finish'
				else if (category.auction_list?.some((auction) => auction.status?.status === "auction")) {
					console.log("auction decision: change 'auction' status to 'finish'");

					for (const auction of category.auction_list) {
						// console.log("auction");
						// console.log(JSON.stringify(auction, null, 2));

						if (auction.status?.status === "auction") {
							// update auction status to finish
							// const dataToUpdateAuction = { ...auction, status_id: finishStatus.id };
							// await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);

							// get auction photo
							const auctionPhoto = await this.auctionPhotoService.getAuctionPhotoByAuctionId(auction.id);

							if (auctionPhoto?.status?.status === "auction") {
								// console.log("auctionPhoto");
								// console.log(JSON.stringify(auctionPhoto, null, 2));

								// get bid list
								const bidlist = await this.bidService.getBidsByAuctionPhotoId(auctionPhoto.id);

								// if there is no bid make status finish
								if (bidlist.length === 0) {
									const updateDataAuctionPhoto = { ...auctionPhoto, status_id: finishStatus.id };
									await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, updateDataAuctionPhoto);

									const dataToUpdatePhoto = { ...auctionPhoto.photo, status_id: finishStatus.id };
									await this.photoService.updatePhoto(auctionPhoto.photo.id, dataToUpdatePhoto);
								} else {
									let updateData = { ...auctionPhoto, status_id: waitPurchaseStatus.id, current_winner_order: 1 };

									// sort bidlist according to bid amount
									bidlist.sort((a, b) => b.bid_amount - a.bid_amount);

									// prepare winner list
									const winnerList = [];
									let i = 0;
									while (i < bidlist.length && winnerList.length < 3) {
										if (!winnerList.includes(bidlist[i].user.id)) winnerList.push(bidlist[i].user.id);
										i++;
									}

									// prepare update data
									for (let i = 0; i < winnerList.length; i++) {
										updateData = { ...updateData, [`winner_user_id_${i + 1}`]: winnerList[i] };
									}

									// update table
									await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, updateData);
								}
							}
						}
					}
				}

				// other stage
				else {
					console.log("do nothing");
				}
			} else {
				// console.log("category status is not approved");
			}

			console.log("\n");
		}

		console.log("[INFO] 🕑 End of Job");
	}
}

export default TimerFacade;
