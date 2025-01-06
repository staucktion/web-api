import React from "react";
import { Button, Box } from "@mui/material";

interface EmailButtonsProps {
	onApprove: () => void;
	onReject: () => void;
}

const EmailButtons: React.FC<EmailButtonsProps> = ({ onApprove, onReject }) => {
	return (
		<Box display="flex" justifyContent="center" gap={2}>
			<Button variant="contained" color="success" onClick={onApprove}>
				Purchase Now
			</Button>
		</Box>
	);
};

export default EmailButtons;
