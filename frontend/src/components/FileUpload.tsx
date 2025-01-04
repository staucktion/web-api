import React, { useState, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import "../styles/Styles.css"; // Import plain CSS file

const FileUpload: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [watermarkedImages, setWatermarkedImages] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	useEffect(() => {
		let email = localStorage.getItem("email");
		const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

		while (!email || !emailRegex.test(email)) {
			email = prompt("Please enter your email address:");
			if (email) {
				localStorage.setItem("email", email);
			}
		}

		setUserEmail(email);
	}, []);

	useEffect(() => {
		const fetchWatermarkedImages = async () => {
			try {
				const response = await fetch(
					"http://localhost:8082/photo/list"
				);
				if (!response.ok) {
					throw new Error("Failed to fetch photos");
				}
				const data: string[] = await response.json();
				const photoUrls = data.map(
					(fileName) =>
						`http://localhost:8082/photo/view/static/${fileName}`
				);
				setWatermarkedImages(photoUrls);
			} catch (err: any) {
				console.error(err);
				setError("Failed to load photos");
			}
		};
		fetchWatermarkedImages();
	}, []);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setSelectedFile(event.target.files[0]);
			setError(null);
			setSuccessMessage(null);
		}
	};

	const uploadFile = async () => {
		if (!selectedFile) {
			setError("Please select a file.");
			return;
		}

		const formData = new FormData();
		formData.append("photo", selectedFile);

		setIsUploading(true);

		try {
			const response = await fetch("http://localhost:8082/photo/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`File upload failed. Status: ${response.status}, Message: ${errorText}`
				);
			}

			const data = await response.json();
			setWatermarkedImages((prevImages) => [
				...prevImages,
				`http://localhost:8082/photo/view/static/${data.watermarkedPath}`,
			]);
			setSuccessMessage("File uploaded successfully!");
			setSelectedFile(null);
		} catch (error: any) {
			console.error("File upload error:", error);
			setError("File upload failed. Check console for details.");
			setSuccessMessage(null);
		} finally {
			setIsUploading(false);
		}
	};

	const sendApproveMail = async (imgSrc: string) => {
		const fileName = imgSrc.split("/").pop();

		try {
			const response = await fetch("http://localhost:8082/mail/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					photoName: fileName,
					action: "Approve Purchase",
					email: userEmail,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Failed to send mail. Status: ${response.status}, Message: ${errorText}`
				);
			}

			alert(`Purchase approved mail sent successfully to ${userEmail}!`);
			setSelectedImage(null);
			setIsModalOpen(false);
		} catch (error: any) {
			console.error("Error sending mail:", error);
			alert("Failed to send mail. Check console for details.");
		}
	};

	const handleImageClick = (imgSrc: string) => {
		setSelectedImage(imgSrc);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedImage(null);
		setIsModalOpen(false);
	};

	return (
		<div className="container">
			<div className="uploadBox">
				<h2 className="uploadTitle">Upload Your Photo</h2>
				<p className="emailText">
					Your email: <strong>{userEmail}</strong>
				</p>
				<div className="uploadControls">
					<label htmlFor="fileInput" className="fileInputLabel">
						Select File
					</label>
					<input
						id="fileInput"
						type="file"
						onChange={handleFileChange}
						accept="image/*"
						style={{ display: "none" }}
					/>
					{selectedFile && (
						<>
							<p className="selectedFile">
								Selected File:{" "}
								<strong>{selectedFile.name}</strong>
							</p>
							<button
								onClick={uploadFile}
								className="uploadButton"
								disabled={isUploading}
							>
								{isUploading ? "Uploading..." : "Upload"}
							</button>
						</>
					)}
				</div>
				{error && <p className="errorMessage">{error}</p>}
				{successMessage && (
					<p className="successMessage">{successMessage}</p>
				)}
			</div>

			<div style={{ padding: "20px", borderTop: "1px solid #ddd" }}>
				<h3>Watermarked Images</h3>
				<div className="imageGrid">
					{watermarkedImages.map((imgSrc, index) => (
						<div
							key={index}
							className="imageCard"
							onClick={() => handleImageClick(imgSrc)}
						>
							<img
								src={imgSrc}
								alt={`Watermarked ${index + 1}`}
								className="image"
							/>
						</div>
					))}
				</div>
			</div>

			<Modal
				open={isModalOpen}
				onClose={handleCloseModal}
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
				BackdropProps={{
					style: { backgroundColor: "rgba(0, 0, 0, 0.8)" }, // siyah şeffaf perde
				}}
			>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "80%",
						maxWidth: "600px",
						backgroundColor: "transparent", // Arka planı kaldır
						boxShadow: "none", // Gölgeyi kaldır
						p: 4,
						textAlign: "center",
						outline: "none",
					}}
				>
					<img
						src={selectedImage || ""}
						alt="Selected"
						className="modalImage"
					/>
					<button
						onClick={() =>
							selectedImage && sendApproveMail(selectedImage)
						}
						className="purchaseButton"
					>
						Purchase Now
					</button>
				</Box>
			</Modal>
		</div>
	);
};

export default FileUpload;
