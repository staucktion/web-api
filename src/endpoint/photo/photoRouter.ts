import express from "express";
import photoFacade from "../../facade/photo/photoFacade";
import uploadPhotoMulter from "src/config/storage/multerConfig";

const router = express.Router();

router.post("/upload", uploadPhotoMulter.single("photo"), async (req, res) => {
  return await photoFacade.uploadPhoto(req, res);
});

export default router;
