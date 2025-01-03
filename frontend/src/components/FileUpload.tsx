import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import EmailButtons from "./EmailButtons.tsx";

const FileUpload: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [watermarkedImages, setWatermarkedImages] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);

	// Validate and retrieve email
	useEffect(() => {
		let email = localStorage.getItem("email");
		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

		while (!email || !emailRegex.test(email)) {
			email = prompt("Please enter your email address:");
			if (email) {
				localStorage.setItem("email", email);
			}
		}

		setUserEmail(email); // Save the valid email
	}, []);

	// Fetch existing watermarked photos on page load
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

	const sendMail = async (action: "APPROVE" | "REJECT", imgSrc: string) => {
		const fileName = imgSrc.split("/").pop();

		try {
			const response = await fetch("http://localhost:8082/mail/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					photoName: fileName, // Photo file name
					action:
						action === "APPROVE"
							? "Approve Purchase"
							: "Reject Purchase", // Match backend action values
					email: userEmail, // Dynamic email entered by the user
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Failed to send mail. Status: ${response.status}, Message: ${errorText}`
				);
			}

			alert(`${action} mail sent successfully to ${userEmail}!`);
			setSelectedImage(null); // Reset selection after action
		} catch (error: any) {
			console.error("Error sending mail:", error);
			alert("Failed to send mail. Check console for details.");
		}
	};

	return (
		<div style={{ textAlign: "center", marginTop: "20px" }}>
			<div
				style={{
					padding: "20px",
					margin: "20px auto",
					maxWidth: "600px",
					boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
					borderRadius: "10px",
					backgroundColor: "#f9f9f9",
				}}
			>
				<h2
					style={{
						fontFamily: "'Roboto', sans-serif",
						color: "#333",
					}}
				>
					Upload Your Photo
				</h2>
				<p style={{ fontSize: "14px", color: "#666" }}>
					Your email: <strong>{userEmail}</strong>
				</p>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: "15px",
						flexDirection: "column",
					}}
				>
					<label
						htmlFor="fileInput"
						style={{
							padding: "10px 20px",
							backgroundColor: "#007BFF",
							color: "#fff",
							cursor: "pointer",
							borderRadius: "5px",
							fontSize: "14px",
							fontWeight: "bold",
						}}
					>
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
							<p style={{ margin: "10px 0", color: "#333" }}>
								Selected File:{" "}
								<strong>{selectedFile.name}</strong>
							</p>
							<button
								onClick={uploadFile}
								style={{
									padding: "10px 20px",
									backgroundColor: isUploading
										? "#cccccc"
										: "#28a745",
									color: "#fff",
									cursor: isUploading
										? "not-allowed"
										: "pointer",
									borderRadius: "5px",
									fontSize: "14px",
									fontWeight: "bold",
									border: "none",
								}}
								disabled={isUploading}
							>
								{isUploading ? "Uploading..." : "Upload"}
							</button>
						</>
					)}
				</div>
				{error && (
					<p style={{ color: "red", marginTop: "10px" }}>{error}</p>
				)}
				{successMessage && (
					<p style={{ color: "green", marginTop: "10px" }}>
						{successMessage}
					</p>
				)}
			</div>

			<div style={{ padding: "20px", borderTop: "1px solid #ddd" }}>
				<h3>Watermarked Images</h3>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "center",
						gap: "30px",
					}}
				>
					{watermarkedImages.map((imgSrc, index) => (
						<div
							key={index}
							style={{
								position: "relative",
								width: "300px",
								height: "200px",
								cursor: "pointer",
								border: "1px solid #ddd",
							}}
							onClick={() => setSelectedImage(imgSrc)} // Select the image
						>
							<img
								src={imgSrc}
								alt={`Watermarked ${index + 1}`}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
							{selectedImage === imgSrc && (
								<Box
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									position="absolute"
									top="0"
									left="0"
									width="100%"
									height="100%"
									bgcolor="rgba(0, 0, 0, 0.7)"
									zIndex={1}
								>
									<EmailButtons
										onApprove={() =>
											sendMail("APPROVE", imgSrc)
										}
										onReject={() =>
											sendMail("REJECT", imgSrc)
										}
									/>
								</Box>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default FileUpload;
