import { Request, Response } from "express";
import * as path from "path";
import Config from "src/config/Config";
import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
import BaseResponseDto from "src/dto/base/BaseResponseDto";
import CategoryDto from "src/dto/category/CategoryDto";
import GetPhotoRequestDto from "src/dto/error/GetPhotoRequestDto";
import LocationDto from "src/dto/location/LocationDto";
import PurchasedPhotoDto from "src/dto/photo/PurchasedPhotoDto";
import ReadAllPhotoResponseDto from "src/dto/photo/ReadAllPhotoResponseDto";
import UploadPhotoDto from "src/dto/photo/UploadPhotoDto";
import CustomError from "src/error/CustomError";
import AndroidNotificationService from "src/service/android/notification/AndroidNotificationService";
import AuctionPhotoService from "src/service/auctionPhoto/AuctionPhotoService";
import CategoryService from "src/service/category/categoryService";
import LocationService from "src/service/location/locationService";
import PhotoService from "src/service/photo/photoService";
import PurchasedPhotoService from "src/service/purchasedPhoto/PurchasedPhotoService";
import StatusService from "src/service/status/StatusService";
import { StatusEnum } from "src/types/statusEnum";
import sendJsonBigint from "src/util/sendJsonBigint";
import { isRequestorValidator } from "src/util/authUtil";
import PhotoValidation from "src/validation/photo/PhotoValidation";

class PhotoFacade {
	private photoService: PhotoService;
	private photoValidation: PhotoValidation;
	private locationService: LocationService;
	private categoryService: CategoryService;
	private purchasedPhotoService: PurchasedPhotoService;
	private statusService: StatusService;
	private androidNotificationService: AndroidNotificationService;
	private auctionPhotoService: AuctionPhotoService;

	constructor() {
		this.photoValidation = new PhotoValidation();
		this.photoService = new PhotoService();
		this.locationService = new LocationService();
		this.categoryService = new CategoryService();
		this.purchasedPhotoService = new PurchasedPhotoService();
		this.statusService = new StatusService();
		this.androidNotificationService = new AndroidNotificationService();
		this.auctionPhotoService = new AuctionPhotoService();
	}

	public async uploadPhoto(req: Request, res: Response): Promise<void> {
		// check if user authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		// check if file uploaded
		if (!req.file) {
			CustomError.handleError(res, CustomError.builder().setMessage("There is no file in the request").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		let uploadPhotoDto: UploadPhotoDto;

		// get valid body from request
		try {
			uploadPhotoDto = await this.photoValidation.uploadPhotoRequest(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// get category
		let category: CategoryDto;
		try {
			category = await this.categoryService.getCategoryById(uploadPhotoDto.categoryId);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		let location: LocationDto;
		try {
			location = await this.locationService.getLocationById(category.location_id);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// add watermark to the uploaded photo
		try {
			await this.photoService.addTextWatermark(`${uploadPhotoDto.destination}${uploadPhotoDto.filename}`, path.join(WATERMARK_PHOTO_DIR, uploadPhotoDto.filename), Config.watermark.text);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// save to database with WAIT status
		try {
			const baseResponseDto: BaseResponseDto = await this.photoService.uploadPhotoDb(uploadPhotoDto.filename, req.user.id, location.id, category.id, uploadPhotoDto.deviceInfo, StatusEnum.WAIT);

			sendJsonBigint(res, baseResponseDto, 200);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listPublicPhotos(_req: Request, res: Response): Promise<void> {
		try {
			// Only show APPROVED photos in the general list
			const instanceList = await this.photoService.listPhotosByStatusAndUserId(StatusEnum.APPROVE, null);
			sendJsonBigint(res, instanceList, 200);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listOwnPhotosAll(req: Request, res: Response): Promise<void> {
		// check if user authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			const instanceList = await this.photoService.listPhotosByStatusAndUserId(null, req.user.id);
			sendJsonBigint(res, instanceList, 200);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listOwnPhotos(req: Request, res: Response): Promise<void> {
		// check if user authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			const instanceList = await this.photoService.listPhotosByStatusAndUserId([StatusEnum.APPROVE, StatusEnum.PURCHASABLE], req.user.id);
			sendJsonBigint(res, instanceList, 200);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listOwnPurchasedPhotoList(req: Request, res: Response): Promise<void> {
		try {
			const instanceList: PurchasedPhotoDto[] = await this.purchasedPhotoService.listOwnPurchasedPhotoList(req.user.id);
			res.status(200).json(instanceList);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listWaitingPhotos(_req: Request, res: Response): Promise<void> {
		try {
			const waitingPhotos = await this.photoService.listPhotosByStatusAndUserId(StatusEnum.WAIT, null, true);
			sendJsonBigint(res, waitingPhotos, 200);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listPublicPurchasablePhotos(_req: Request, res: Response): Promise<void> {
		try {
			let purchasablePhotos = await this.photoService.listPhotosByStatusAndUserId(StatusEnum.PURCHASABLE, null);

			purchasablePhotos = purchasablePhotos.filter((photo) => !!photo.purchase_now_price && photo.purchase_now_price > 0);

			sendJsonBigint(res, purchasablePhotos, 200);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listPublicAuctionPhotos(_req: Request, res: Response): Promise<void> {
		try {
			const auctionPhotos = await this.photoService.listPhotosByStatusAndUserId(StatusEnum.AUCTION, null);
			sendJsonBigint(res, auctionPhotos, 200);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async listPublicVotingPhotos(_req: Request, res: Response): Promise<void> {
		try {
			const votingPhotos = await this.photoService.listPhotosByStatusAndUserId(StatusEnum.VOTE, null);
			sendJsonBigint(res, votingPhotos, 200);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async approveRejectPhoto(req: Request, res: Response): Promise<void> {
		// Check authentication
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		try {
			// Validate request
			const { photoId, action, reason } = await this.photoValidation.validateApproveRejectRequest(req);

			// Determine new status based on action
			const newStatus = action === "approve" ? StatusEnum.APPROVE : StatusEnum.REJECT;

			// Update photo status
			const updatedPhoto = await this.photoService.updatePhotoStatus(photoId, newStatus, reason);

			sendJsonBigint(
				res,
				{
					message: `Photo has been ${action === "approve" ? "approved" : "rejected"} successfully`,
					photo: updatedPhoto,
				},
				200
			);

			// Send notification to the user (void so no need to handle error)
			void this.androidNotificationService.sendAndroidNotification(
				updatedPhoto.user_id,
				`Your Photo Has Been ${action === "approve" ? "Approved" : "Rejected"}`,
				newStatus === StatusEnum.APPROVE ? "Please decide whether to auction your photo or not." : `Your photo has been rejected with the following reason: ${reason}`,
				{
					photo_id: updatedPhoto.id.toString(),
				}
			);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async getPhoto(req: Request, res: Response): Promise<void> {
		let getPhotoRequestDto: GetPhotoRequestDto;

		// get valid body from request
		try {
			getPhotoRequestDto = await this.photoValidation.getPhotoRequest(req);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		try {
			const photoPath = await this.photoService.getPhotoPath(getPhotoRequestDto.photoId, isRequestorValidator(req));
			res.sendFile(photoPath);
			return;
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async deletePhoto(req: Request, res: Response): Promise<void> {
		// check if user authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		// check if photo id provided
		if (!req.params.photoId) {
			CustomError.handleError(res, CustomError.builder().setMessage("photoId must be provided").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		try {
			await this.photoService.deletePhoto(parseInt(req.params.photoId));
			sendJsonBigint(res, { message: "Photo deleted successfully" }, 200);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}
	}

	public async updatePhotoPurchaseNowPrice(req: Request, res: Response): Promise<void> {
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		let photoId: number;
		let price: number | null;
		let photo;

		try {
			({ photoId, price } = await this.photoValidation.updatePhotoPurchaseNowPriceRequest(req));
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		try {
			photo = await this.photoService.getPhotoById(photoId);
			if (!photo) {
				CustomError.handleError(res, CustomError.builder().setMessage("Photo not found").setErrorType("Not Found").setStatusCode(404).build());
				return;
			}
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		if (photo.user_id !== req.user.id) {
			CustomError.handleError(res, CustomError.builder().setMessage("You are not authorized to update this photo").setErrorType("Unauthorized").setStatusCode(403).build());
			return;
		}

		const soldStatus = await this.statusService.getStatusFromName("sold");
		if (photo.status_id === soldStatus.id) {
			CustomError.handleError(res, CustomError.builder().setMessage("Photo is already sold").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		const approveStatus = await this.statusService.getStatusFromName("approve");
		const purchasableStatus = await this.statusService.getStatusFromName("purchasable");
		if (![approveStatus.id, purchasableStatus.id].includes(photo.status_id)) {
			CustomError.handleError(res, CustomError.builder().setMessage("Photo needs to be approved first to update purchase now price").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		try {
			await this.photoService.updatePhotoPurchaseNowPrice(photoId, price);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		sendJsonBigint(res, { message: "Photo purchase now price updated successfully" }, 200);
	}

	public async updatePhotoAuctionableStatus(req: Request, res: Response): Promise<void> {
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		let photoId: number;
		let auctionable: boolean;
		let photo;

		try {
			({ photoId, auctionable } = await this.photoValidation.updatePhotoAuctionableStatusRequest(req));
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		try {
			photo = await this.photoService.getPhotoById(photoId);
			if (!photo) {
				CustomError.handleError(res, CustomError.builder().setMessage("Photo not found").setErrorType("Not Found").setStatusCode(404).build());
				return;
			}
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		if (photo.user_id !== req.user.id) {
			CustomError.handleError(res, CustomError.builder().setMessage("You are not authorized to update this photo").setErrorType("Unauthorized").setStatusCode(403).build());
			return;
		}

		const soldStatus = await this.statusService.getStatusFromName("sold");
		if (photo.status_id === soldStatus.id) {
			CustomError.handleError(res, CustomError.builder().setMessage("Photo is already sold").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		const approveStatus = await this.statusService.getStatusFromName("approve");
		const purchasableStatus = await this.statusService.getStatusFromName("purchasable");
		if (![approveStatus.id, purchasableStatus.id].includes(photo.status_id)) {
			CustomError.handleError(res, CustomError.builder().setMessage("Photo needs to be approved first to update purchase now price").setErrorType("Bad Request").setStatusCode(400).build());
			return;
		}

		try {
			await this.photoService.updatePhotoAuctionableStatus(photoId, auctionable);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		sendJsonBigint(res, { message: "Photo auctionable status updated successfully" }, 200);
	}

	public async listOwnPendingPurchasePhotos(req: Request, res: Response): Promise<void> {
		let allPhotoList: ReadAllPhotoResponseDto[];
		const filteredPhotoList: ReadAllPhotoResponseDto[] = [];
		// check if user authenticated
		if (!req.user) {
			CustomError.handleError(res, CustomError.builder().setMessage("Unauthorized").setErrorType("Unauthorized").setStatusCode(401).build());
			return;
		}

		// get all photos with status wait purchase after auction
		try {
			allPhotoList = await this.photoService.listPhotosByStatusAndUserId([StatusEnum.WAIT_PURCHASE_AFTER_AUCTION], null);
		} catch (error) {
			CustomError.handleError(res, error);
			return;
		}

		// filter photos by winner
		for (const photo of allPhotoList) {
			try {
				const auctionPhoto = await this.auctionPhotoService.getAuctionPhotoByPhotoIdPlain(photo.id);
				if (auctionPhoto[`winner_user_id_${auctionPhoto.current_winner_order}`] == req.user.id) filteredPhotoList.push(photo);
			} catch (error) {
				CustomError.handleError(res, error);
				return;
			}
		}

		sendJsonBigint(res, filteredPhotoList, 200);
		return;
	}
}

export default PhotoFacade;
