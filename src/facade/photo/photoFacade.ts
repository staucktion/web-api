import { Request, Response } from "express";
import Config from "src/config/Config";
import PhotoService from "src/service/photo/PhotoService";

class PhotoFacade {
  private photoService: PhotoService;

  constructor() {
    this.photoService = new PhotoService();
  }

  public async uploadPhoto(req: Request, res: Response): Promise<Response> {
    // validate input photo
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const photoSource = req.file.destination;
    const photoName = req.file.filename;

    // todo validation kısmına alınıcak

    // Add a watermark to the uploaded photo
    try {
      await this.photoService.addTextWatermark(
        `${photoSource}${photoName}`,
        `./storage/watermark/${photoName}`,
        Config.watermark.text,
        Config.watermark.fontSize,
        Config.watermark.transparency
      );
    } catch (error: any) {
      return res.status(500).send(error.message);
    }

    return res.status(200).send();
  }
}

export default PhotoFacade;
