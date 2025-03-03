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

		categoryList.forEach((category) => {
			if (category.status?.status === "approve") {
				// console.log("category");
				// console.log(category);

				if (!category.auction_list?.length || category.auction_list.some((auction) => auction.status?.status !== "finish")) {
					
					console.log("Auction is needed to create for category:", category.name);
					this.auctionService.listAllAuctions();
				} else {
					console.log("other stage rather than create auction");
				}
			} else {
				// console.log("category status is not approved");
			}
		});
	}
}

export default TimerFacade;
