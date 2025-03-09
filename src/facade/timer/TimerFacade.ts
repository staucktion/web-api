import AuctionService from "src/service/auction/AuctionService";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
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

	constructor() {
		this.timerService = new TimerService();
		this.categoryService = new CategoryService();
		this.auctionService = new AuctionService();
		this.statusService = new StatusService();
		this.photoService = new PhotoService();
		this.auctionPhotoService = new AuctionPhotoService();
	}

	public async cronJob() {
		console.log("[INFO] 🕑 Job is running at:", new Date().toISOString());
		this.timerService.saveLastTriggerTimeToDb();

		const categoryList: any = await this.categoryService.getAllCategories();

		const auctionStatus = await this.statusService.getStatusFromName("auction");
		const voteStatus = await this.statusService.getStatusFromName("vote");
		const purchasableStatus = await this.statusService.getStatusFromName("purchasable");

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

				// other stage
				else {
					console.log("do nothing");
				}
			} else {
				// console.log("category status is not approved");
			}

			console.log("\n\n");
		}

		console.log("[INFO] 🕑 End of Job");
	}
}

export default TimerFacade;
