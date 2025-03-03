import AuctionService from "src/service/auction/AuctionService";
import CategoryService from "src/service/category/CategoryService";
import StatusService from "src/service/status/StatusService";
import TimerService from "src/service/timer/TimerService";

class TimerFacade {
	private timerService: TimerService;
	private categoryService: CategoryService;
	private auctionService: AuctionService;
	private statusService: StatusService;

	constructor() {
		this.timerService = new TimerService();
		this.categoryService = new CategoryService();
		this.auctionService = new AuctionService();
		this.statusService = new StatusService();
	}

	public async cronJob() {
		console.log("[INFO] 🕑 Job is running at:", new Date().toISOString());
		this.timerService.saveLastTriggerTimeToDb();

		const categoryList = await this.categoryService.listAllCategories();

		for (const category of categoryList) {
			console.log(JSON.stringify(category, null, 2));
			if (category.status?.status === "approve") {
				// console.log("category");
				// console.log(JSON.stringify(category, null, 2));

				// creating new auction with vote status
				if (
					(!category.auction_list?.length || category.auction_list.every((auction) => auction.status?.status === "finish")) &&
					category.photo_list?.some((photo) => photo.status?.status === "approve")
				) {
					console.log("auction is needed to create");
					await this.auctionService.insertNewAuction(category.id);
				}

				// change auction status from 'vote' to 'auction'
				else if (category.auction_list?.some((auction) => auction.status?.status === "vote")) {
					console.log("change 'vote' status to 'auction'");

					const auctionStatus = await this.statusService.getStatusFromName("auction");

					for (const auction of category.auction_list) {
						// console.log("auction");
						// console.log(JSON.stringify(auction, null, 2));

						if (auction.status?.status === "vote") {
							console.log(`Auction status change from 'vote' to 'auction'.`);

							const dataToUpdateAuction = { ...auction, status_id: auctionStatus.id };
							await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);
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
