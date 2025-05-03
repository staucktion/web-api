import * as path from "path";
import PhotoDto from "src/dto/photo/PhotoDto";

export const isAcceptablePhotoExtension = (filename: string): boolean => {
	const ext = path.extname(filename).toLowerCase();
	return [".png", ".jpg", ".jpeg"].includes(ext);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapPhotoToPhotoDto = (photo: any): PhotoDto => ({
	id: Number(photo.id),
	file_path: photo.file_path,
	title: photo.title,
	device_info: photo.device_info,
	vote_count: Number(photo.vote_count),
	user_id: Number(photo.user_id),
	auction_id: photo.auction_id ? Number(photo.auction_id) : null,
	location_id: Number(photo.location_id),
	category_id: Number(photo.category_id),
	is_auctionable: photo.is_auctionable,
	status_id: Number(photo.status_id),
	purchase_now_price: photo.purchase_now_price ? Number(photo.purchase_now_price) : null,
	purchased_at: photo.purchased_at ? new Date(photo.purchased_at) : null,
	created_at: photo.created_at,
	updated_at: photo.updated_at,
	category: photo.category,
	status: photo.status,
	user: photo.user,
});