import * as path from "path";

export const isAcceptablePhotoExtension = (filename: string): boolean => {
	const ext = path.extname(filename).toLowerCase();
	return [".png", ".jpg", ".jpeg"].includes(ext);
};
