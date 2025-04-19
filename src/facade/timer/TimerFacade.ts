import SendNotificationDto from "src/dto/notification/SendNotificationDto";
import AuctionService from "src/service/auction/AuctionService";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import BidService from "src/service/bid/BidService";
import CategoryService from "src/service/category/categoryService";
import NotificationService from "src/service/notification/NotificationService";
import PhotoService from "src/service/photo/photoService";
import StatusService from "src/service/status/StatusService";
import UserService from "src/service/user/userService";
import { cronEnum } from "src/types/cronEnum";
import WebSocketManager from "src/websocket/WebSocketManager";

class TimerFacade {
	private categoryService: CategoryService;
	private auctionService: AuctionService;
	private statusService: StatusService;
	private photoService: PhotoService;
	private auctionPhotoService: AuctionPhotoService;
	private bidService: BidService;
	private userService: UserService;
	private webSocketManager: WebSocketManager;
	private notificationService: NotificationService;

	constructor(webSocketManager: WebSocketManager) {
		this.categoryService = new CategoryService();
		this.auctionService = new AuctionService();
		this.statusService = new StatusService();
		this.photoService = new PhotoService();
		this.auctionPhotoService = new AuctionPhotoService();
		this.bidService = new BidService(webSocketManager);
		this.userService = new UserService();
		this.notificationService = new NotificationService(webSocketManager);
		this.webSocketManager = webSocketManager;
	}

	public async cronJob(cronId: number) {
		if (!Config.isTimerActive) return;
		console.log(`[INFO] 🕑 Job is running for ${cronEnum[cronId]} at: ${new Date().toISOString()}`);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const categoryList: any = await this.categoryService.getAllCategories();
		const waitPurchaseStatus = await this.statusService.getStatusFromName("wait_purchase_after_auction");
		const voteStatus = await this.statusService.getStatusFromName("vote");
		const auctionStatus = await this.statusService.getStatusFromName("auction");
		const purchasableStatus = await this.statusService.getStatusFromName("purchasable");
		const finishStatus = await this.statusService.getStatusFromName("finish");
		const bannedStatus = await this.statusService.getStatusFromName("banned");

		if (cronEnum.STARTER == cronId) {
			for (const category of categoryList) {
				if (category.status?.status === "approve") {
					// creating new auction with vote status
					if (
						(!category.auction_list?.length || category.auction_list.every((auction) => auction.status?.status === "finish")) &&
						category.photo_list?.some((photo) => photo.status?.status === "approve" && photo.is_auctionable === true)
					) {
						console.log("[INFO] Auction Decision: create new auction");
						const createdAuction = await this.auctionService.insertNewAuction(category.id);

						for (const photo of category.photo_list) {
							if (photo.status.status === "approve" && photo.is_auctionable === true) {
								const dataToUpdatePhoto = { ...photo, auction_id: createdAuction.id, status_id: voteStatus.id };
								await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
							}
						}
					}
				}
			}
		} else if (cronEnum.VOTE == cronId) {
			for (const category of categoryList) {
				if (category.status?.status === "approve") {
					// change auction status from 'vote' to 'auction'
					if (category.auction_list?.some((auction) => auction.status?.status === "vote")) {
						console.log("[INFO] Auction Decision: change 'vote' status to 'auction'");

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
				}
			}
		} else if (cronEnum.AUCTION == cronId) {
			for (const category of categoryList) {
				if (category.status?.status === "approve") {
					// change auction status from 'auction' to 'finish' or 'wait_purchase_after_auction'
					if (category.auction_list?.some((auction) => auction.status?.status === "auction")) {
						for (const auction of category.auction_list) {
							if (auction.status?.status === "auction") {
								// get auction photo list
								const auctionPhotoList = await this.auctionPhotoService.getAuctionPhotoListByAuctionId(auction.id);
								for (const auctionPhoto of auctionPhotoList) {
									if (auctionPhoto?.status?.status === "auction") {
										// get bid list
										const bidlist = await this.bidService.getBidsByAuctionPhotoId(auctionPhoto.id);

										// if there is no bid make status finish
										if (bidlist.length === 0) {
											console.log("[INFO] Auction Decision: change 'auction' status to 'finish'");
											const updateDataAuctionPhoto = { ...auctionPhoto, status_id: finishStatus.id };
											await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, updateDataAuctionPhoto);

											const dataToUpdatePhoto = { ...auctionPhoto.photo, status_id: finishStatus.id };
											await this.photoService.updatePhoto(auctionPhoto.photo.id, dataToUpdatePhoto);

											const dataToUpdateAuction = { ...auction, status_id: finishStatus.id };
											await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);
										} else {
											console.log("[INFO] Auction Decision: change 'auction' status to 'wait_purchase_after_auction'");
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
											const updatedAuctionPhoto = await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, updateData);

											const dataToUpdatePhoto = { ...auctionPhoto.photo, status_id: waitPurchaseStatus.id };
											await this.photoService.updatePhoto(auctionPhoto.photo.id, dataToUpdatePhoto);

											const dataToUpdateAuction = { ...auction, status_id: waitPurchaseStatus.id };
											await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);

											// send ws message to rooms
											this.webSocketManager.sendToRoom(`auction_photo_id_${auctionPhoto.id}`, "finish_auction", {
												aucitonPhoto: updatedAuctionPhoto,
												room: `auction_photo_id_${auctionPhoto.id}`,
											});

											// send notification to winners
											const winners = [
												{ userId: updatedAuctionPhoto.winner_user_id_1, message: "You won the auction in the first place." },
												{ userId: updatedAuctionPhoto.winner_user_id_2, message: "You won the auction in the second place." },
												{ userId: updatedAuctionPhoto.winner_user_id_3, message: "You won the auction in the third place." },
											];

											for (const winner of winners) {
												if (!winner.userId) continue;

												const notificationDto: SendNotificationDto = {
													userId: winner.userId,
													type: "info",
													message: winner.message,
												};

												try {
													await this.notificationService.sendNotification(1, notificationDto);
												} catch (error) {
													console.error(error);
													return;
												}
											}
										}
									}
								}

								// filter 'purchasable' photos and make their status 'finish'
								const filteredPhotos = auction.photo_list.filter((photo) => photo.status_id === 7);
								for (const photo of filteredPhotos) {
									const dataToUpdatePhoto = { ...photo, status_id: finishStatus.id };
									await this.photoService.updatePhoto(photo.id, dataToUpdatePhoto);
								}
							}
						}
					}
				}
			}
		} else if (cronEnum.PURCHASE_AFTER_AUCTION == cronId) {
			for (const category of categoryList) {
				if (category.status?.status === "approve") {
					// change auction status from 'wait_purchase_after_auction' to 'wait_purchase_after_auction' or 'finish'
					if (category.auction_list?.some((auction) => auction.status?.status === "wait_purchase_after_auction")) {
						for (const auction of category.auction_list) {
							if (auction.status?.status === "wait_purchase_after_auction") {
								// get auction photo
								const auctionPhotoList = await this.auctionPhotoService.getAuctionPhotoListByAuctionId(auction.id);

								for (const auctionPhoto of auctionPhotoList) {
									// if current order is user 1 set status banned
									if (auctionPhoto.current_winner_order === 1) {
										const dataToUpdateUser = { status_id: bannedStatus.id };
										await this.userService.updateUser(auctionPhoto.winner_user_1.id, dataToUpdateUser);
									}

									// if next winner not exists set status to finish
									if (!auctionPhoto[`winner_user_id_${auctionPhoto.current_winner_order + 1}`]) {
										console.log("[INFO] Auction Decision: change 'wait_purchase_after_auction' to 'finish'");

										const dataToUpdateAuctionPhoto = { ...auctionPhoto, status_id: finishStatus.id };
										await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, dataToUpdateAuctionPhoto);

										const dataToUpdatePhoto = { ...auctionPhoto.photo, status_id: finishStatus.id };
										await this.photoService.updatePhoto(auctionPhoto.photo.id, dataToUpdatePhoto);

										const dataToUpdateAuction = { ...auction, status_id: finishStatus.id };
										await this.auctionService.updateAuction(auction.id, dataToUpdateAuction);
									}

									// if next winner exists
									else {
										console.log(`[INFO] Auction Decision: stay 'wait_purchase_after_auction' and wait for next winner : ${auctionPhoto.current_winner_order + 1}`);
										const dataToUpdateAuctionPhoto = { ...auctionPhoto, current_winner_order: auctionPhoto.current_winner_order + 1 };
										await this.auctionPhotoService.updateAuctionPhoto(auctionPhoto.id, dataToUpdateAuctionPhoto);
									}
								}
							}
						}
					}
				}
			}
		}

		console.log("[INFO] 🕑 End of cron job");
	}
}

export default TimerFacade;
