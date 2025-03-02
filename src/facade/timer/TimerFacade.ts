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
			// todo add if category is valid.
			// todo add if auction exist and statuses of all is available to start new one.
			if (category.auction_list?.length === 0) {
				this.auctionService.listAllAuctions();
				console.warn("no auctions");
			}
		});
	}
}

export default TimerFacade;
