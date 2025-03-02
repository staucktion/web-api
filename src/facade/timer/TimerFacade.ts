// import { Request, Response } from "express";
// import * as path from "path";
// import Config from "src/config/Config";
// import { WATERMARK_PHOTO_DIR } from "src/constants/photoConstants";
// import BaseResponseDto from "src/dto/base/BaseResponseDto";
// import GetPhotoRequestDto from "src/dto/error/GetPhotoRequestDto";
// import UploadPhotoDto from "src/dto/photo/UploadPhotoDto";
// import CustomError from "src/error/CustomError";
// import TimerService from "src/service/timer/TimerService";

// class TimerFacade {
// 	private timerService: TimerService;

// 	constructor() {
// 		this.timerService = new TimerService();
// 	}

// 	public async getCronInformation(req: Request, res: Response): Promise<void> {
// 		let uploadPhotoDto: UploadPhotoDto;

// 		// get valid body from request
// 		try {
// 			uploadPhotoDto = await this.photoValidation.uploadPhotoRequest(req);
// 		} catch (error: any) {
// 			CustomError.handleError(res, error);
// 			return;
// 		}

// 		// add watermark to the uploaded photo
// 		try {
// 			await this.photoService.addTextWatermark(`${uploadPhotoDto.destination}${uploadPhotoDto.filename}`, path.join(WATERMARK_PHOTO_DIR, uploadPhotoDto.filename), Config.watermark.text);
// 		} catch (error: any) {
// 			CustomError.handleError(res, error);
// 			return;
// 		}

// 		// save to database
// 		try {
// 			const baseResponseDto: BaseResponseDto = await this.photoService.uploadPhotoDb(req.user, uploadPhotoDto.filename);
// 			res.status(200).json(baseResponseDto);
// 			return;
// 		} catch (error: any) {
// 			CustomError.handleError(res, error);
// 			return;
// 		}
// 	}
// }

// export default TimerFacade;
