import photoService from "../../service/photo/photoService";
import envVariables from "src/env/envVariables";

const uploadPhoto = async (req, res) => {
  // photo validation
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const photoSource = req.file.destination;
  const photoName = req.file.filename;

  try {
    await photoService.addTextWatermark(
      `${photoSource}${photoName}`,
      `./storage/watermark/${photoName}`,
      envVariables.WATERMARK_TEXT,
      envVariables.WATERMARK_FONT_SIZE,
      envVariables.WATERMARK_TRANSPARENCY
    );
  } catch (e: any) {
    return res.status(500).send(e.message);
  }

  return res.status(200).send();
};

export default {
  uploadPhoto,
};
