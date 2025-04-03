import { PrismaClient } from "@prisma/client";
import BidResponseDto from "src/dto/bid/BidResponseDto";
import DateUtil from "src/util/dateUtil";
import handlePrismaError from "src/util/handlePrismaError";
import handlePrismaType from "src/util/handlePrismaType";
import PrismaUtil from "src/util/PrismaUtil";
import WebSocketManager from "src/websocket/WebSocketManager";

class BidService {
	private webSocketManager: WebSocketManager;
	private prisma: PrismaClient;

	constructor(webSocketManager: WebSocketManager) {
		this.webSocketManager = webSocketManager;
		this.prisma = PrismaUtil.getPrismaClient();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async insertNewBid(data: any): Promise<any> {
		let instance;
		try {
			const newInstanceTemp = await this.prisma.bid.create({ data: { ...data, created_at: DateUtil.getNowWithoutMs() } });
			instance = handlePrismaType(newInstanceTemp);
		} catch (error) {
			handlePrismaError(error);
		}

		// send ws message to dynamically created room
		this.webSocketManager.sendToRoom(`auction_photo_id_${data.auction_photo_id}`, "new_bid", { bid: instance, room: `auction_photo_id_${data.auction_photo_id}` });

		return instance;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async getBidsByAuctionPhotoId(auctionPhotoId: number): Promise<any> {
		try {
			const instanceList = await this.prisma.bid.findMany({
				where: {
					auction_photo_id: auctionPhotoId,
				},
				include: {
					user: true,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}

	public async getBidsByAuctionPhotoIdPlain(auctionPhotoId: number): Promise<BidResponseDto> {
		try {
			const instanceList = await this.prisma.bid.findMany({
				where: {
					auction_photo_id: auctionPhotoId,
				},
			});

			return handlePrismaType(instanceList);
		} catch (error) {
			handlePrismaError(error);
		}
	}
}

export default BidService;
