"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useUser } from "@/hooks/use-user";

interface AccountInfoProps {
	onImageSelect: (file: File) => void;
	previewImage?: string;
}

export function AccountInfo({ onImageSelect, previewImage }: AccountInfoProps): React.JSX.Element {
	const { user } = useUser();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			onImageSelect(file);
		}
	};

	const displayImage =
		previewImage || (user?.profilepic ? `http://localhost:5000${user.profilepic}` : undefined) || "/assets/avatar.png";

	return (
		<Card>
			<CardContent>
				<Stack spacing={2} sx={{ alignItems: "center" }}>
					<div>
						<Avatar src={displayImage} sx={{ height: "80px", width: "80px" }} />
					</div>
					<Stack spacing={1} sx={{ textAlign: "center" }}>
						<Typography variant="h5">{user?.name || user?.username || "User"}</Typography>
						<Typography color="text.secondary" variant="body2">
							{user?.email || "No email"}
						</Typography>
					</Stack>
				</Stack>
			</CardContent>
			<Divider />
			<CardActions>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept="image/*"
					style={{ display: "none" }}
				/>
				<Button fullWidth variant="text" onClick={handleUploadClick}>
					Upload picture
				</Button>
			</CardActions>
		</Card>
	);
}
