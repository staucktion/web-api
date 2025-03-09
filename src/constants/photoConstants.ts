import * as path from "path";
import * as fs from "fs";

const STORAGE_PATH = path.join(".", "storage");

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_PATH)) {
	fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Define and create photo directories
export const ORIGINAL_PHOTO_DIR = path.join(STORAGE_PATH, "upload") + "/";
export const WATERMARK_PHOTO_DIR = path.join(STORAGE_PATH, "watermark") + "/";
export const PROFILE_PICTURE_DIR = path.join(STORAGE_PATH, "profile") + "/";

// Ensure all directories exist
[ORIGINAL_PHOTO_DIR, WATERMARK_PHOTO_DIR, PROFILE_PICTURE_DIR].forEach((dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});
