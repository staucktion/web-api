import AuctionService from "src/service/auction/AuctionService";
import CategoryService from "src/service/category/CategoryService";
import TimerService from "src/service/timer/TimerService";

class TimerFacade {
	private timerService: TimerService;
	private categoryService: CategoryService;
	private auctionService: AuctionService;

	constructor() {
		this.timerService = new TimerService();
		this.categoryService = new CategoryService();
		this.auctionService = new AuctionService();
	}

	public async cronJob() {
		console.log("[INFO] 🕑 Job is running at:", new Date().toISOString());
		this.timerService.saveLastTriggerTimeToDb();

		const categoryList = await this.categoryService.listAllCategories();

		for (const category of categoryList) {
			if (category.status?.status === "approve") {
				// console.log("category");
				// console.log(JSON.stringify(category, null, 2));

				// creating new auction with vote status
				if (
					(!category.auction_list?.length || category.auction_list.every((auction) => auction.status?.status === "finish")) &&
					category.photo_list?.some((photo) => photo.status?.status === "approve")
				) {
					console.log("auction is needed to create for category:", category.id);
					await this.auctionService.insertNewAuction(category);
				}

				// moving vote status to auction
				else if (!category.auction_list?.length && category.auction_list.some((auction) => auction.status?.status === "vote")) {
					console.log("'vote' statusu olan  'acution' statusune geçmeli");
				}
			} else {
				// console.log("category status is not approved");
			}
		}
	}
}

export default TimerFacade;
