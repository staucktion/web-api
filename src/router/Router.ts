import express from "express";
import AdminEndpoint from "src/endpoint/admin/AdminEndpoint";
import AuctionPhotoEndpoint from "src/endpoint/auctionPhoto/AuctionPhotoEndpoint";
import AuthEndpoint from "src/endpoint/auth/AuthEndpoint";
import BankEndpoint from "src/endpoint/bank/BankEndpoint";
import BidEndpoint from "src/endpoint/bid/BidEndpoint";
import CategoryEndpoint from "src/endpoint/category/CategoryEndpoint";
import HealthEndpoint from "src/endpoint/health/HealthEndpoint";
import LocationEndpoint from "src/endpoint/location/LocationEndpoint";
import MailEndpoint from "src/endpoint/mail/MailEndpoint";
import NotificationEndpoint from "src/endpoint/notification/NotificationEndpoint";
import PhotoEndpoint from "src/endpoint/photo/PhotoEndpoint";
import UserEndpoint from "src/endpoint/user/UserEndpoint";
import VoteEndpoint from "src/endpoint/vote/VoteEndpoint";
import WebSocketManager from "src/websocket/WebSocketManager";
import ProfitEndpoint from "src/endpoint/profit/ProfitEndpoint";
import CronEndpoint from "src/endpoint/cron/CronEndpoint";

class Router {
	private healthEndpoint: HealthEndpoint;
	private photoEndpoint: PhotoEndpoint;
	private mailEndpoint: MailEndpoint;
	private authEndpoint: AuthEndpoint;
	private bankEndpoint: BankEndpoint;
	private locationEndpoint: LocationEndpoint;
	private categoryEndpoint: CategoryEndpoint;
	private userEndpoint: UserEndpoint;
	private notificationEndpoint: NotificationEndpoint;
	private bidEndpoint: BidEndpoint;
	private voteEndpoint: VoteEndpoint;
	private auctionPhotoEndpoint: AuctionPhotoEndpoint;
	private adminEndpoint: AdminEndpoint;
	private profitEndpoint: ProfitEndpoint;
	private cronEdpoint: CronEndpoint;

	constructor(webSocketManager: WebSocketManager) {
		this.healthEndpoint = new HealthEndpoint();
		this.photoEndpoint = new PhotoEndpoint();
		this.mailEndpoint = new MailEndpoint();
		this.authEndpoint = new AuthEndpoint();
		this.bankEndpoint = new BankEndpoint();
		this.locationEndpoint = new LocationEndpoint();
		this.categoryEndpoint = new CategoryEndpoint();
		this.userEndpoint = new UserEndpoint();
		this.notificationEndpoint = new NotificationEndpoint(webSocketManager);
		this.bidEndpoint = new BidEndpoint(webSocketManager);
		this.voteEndpoint = new VoteEndpoint();
		this.auctionPhotoEndpoint = new AuctionPhotoEndpoint();
		this.adminEndpoint = new AdminEndpoint();
		this.profitEndpoint = new ProfitEndpoint();
		this.cronEdpoint = new CronEndpoint();
	}

	public setupRoute(app: express.Application): void {
		app.use(this.healthEndpoint.getRouter());
		app.use(this.photoEndpoint.getRouter());
		app.use(this.mailEndpoint.getRouter());
		app.use(this.authEndpoint.getRouter());
		app.use(this.bankEndpoint.getRouter());
		app.use(this.locationEndpoint.getRouter());
		app.use(this.categoryEndpoint.getRouter());
		app.use(this.userEndpoint.getRouter());
		app.use(this.notificationEndpoint.getRouter());
		app.use(this.bidEndpoint.getRouter());
		app.use(this.voteEndpoint.getRouter());
		app.use(this.auctionPhotoEndpoint.getRouter());
		app.use(this.adminEndpoint.getRouter());
		app.use(this.profitEndpoint.getRouter());
		app.use(this.cronEdpoint.getRouter());
	}
}

export default Router;
