import * as fs from "fs";
import * as path from "path";
import {
	ORIGINAL_PHOTO_DIR,
	WATERMARK_PHOTO_DIR,
} from "src/constants/photoConstants";
import { isAcceptablePhotoExtension } from "src/util/photoUtil";

function clearUploads() {
	const dirsToClean = [ORIGINAL_PHOTO_DIR, WATERMARK_PHOTO_DIR];
	dirsToClean.forEach((dir) => {
		fs.readdirSync(dir)
			.filter((file) => isAcceptablePhotoExtension(file))
			.forEach((file) => fs.rmSync(path.join(dir, file)));
		console.log(`${dir} cleared`);
	});
	console.log("Uploads cleared");
}

clearUploads();
