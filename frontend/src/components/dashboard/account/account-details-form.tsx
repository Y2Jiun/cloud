"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface AccountDetailsFormProps {
	selectedImage?: File;
	previewImageUrl?: string;
	onImageSaved?: () => void;
}

export function AccountDetailsForm({
	selectedImage,
	previewImageUrl,
	onImageSaved,
}: AccountDetailsFormProps): React.JSX.Element {
	const { user, checkSession } = useUser();
	const [isLoading, setIsLoading] = React.useState(false);
	const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [passwordError, setPasswordError] = React.useState<string>("");

	// Form state
	const [formData, setFormData] = React.useState({
		username: "",
		lastName: "",
		email: "",
		phone: "",
		newPassword: "",
		confirmPassword: "",
	});

	// Load user data when component mounts
	React.useEffect(() => {
		console.log("User data:", user); // Debug log
		if (user) {
			setFormData({
				username: user.username || "",
				lastName: "", // We'll keep this empty for now as requested
				email: user.email || "",
				phone: (user as any).contact || "", // Load from contact field
				newPassword: "",
				confirmPassword: "",
			});
		}
	}, [user]);

	const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear password error when user starts typing
		if (field === "newPassword" || field === "confirmPassword") {
			setPasswordError("");
		}

		// Real-time password validation
		if (field === "confirmPassword" && formData.newPassword && value !== formData.newPassword) {
			setPasswordError("Passwords do not match");
		} else if (field === "newPassword" && formData.confirmPassword && value !== formData.confirmPassword) {
			setPasswordError("Passwords do not match");
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			// Validate passwords match if changing password
			if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
				setPasswordError("Passwords do not match");
				setMessage({ type: "error", text: "Passwords do not match" });
				setIsLoading(false);
				return;
			}

			// Check if there are any password errors
			if (passwordError) {
				setMessage({ type: "error", text: passwordError });
				setIsLoading(false);
				return;
			}

			// Prepare update data
			const updateData: any = {
				username: formData.username,
				contact: formData.phone,
			};

			// Add password if provided
			if (formData.newPassword) {
				updateData.password = formData.newPassword;
			}

			// Upload image first if selected
			if (selectedImage) {
				console.log("Uploading image...", selectedImage.name);

				const uploadResult = await apiClient.uploadImage(selectedImage);
				console.log("Image upload result:", uploadResult);

				if (uploadResult.success && uploadResult.data) {
					updateData.profilepic = uploadResult.data.url;
				} else {
					console.error("Image upload failed:", uploadResult.error);
					setMessage({ type: "error", text: uploadResult.error || "Failed to upload image" });
					setIsLoading(false);
					return;
				}
			}

			// Update profile
			console.log("Updating profile with data:", updateData);
			const response = await apiClient.updateProfile(updateData);
			console.log("Profile update response:", response);

			if (response.success) {
				setMessage({ type: "success", text: "Profile updated successfully!" });
				// Refresh user session to get updated data
				console.log("Refreshing user session...");
				await checkSession?.();

				// Notify parent component that image was saved
				if (selectedImage && onImageSaved) {
					onImageSaved();
				}
			} else {
				setMessage({ type: "error", text: response.error || "Failed to update profile" });
			}
		} catch (error) {
			console.error("Update profile error:", error);
			setMessage({ type: "error", text: "An error occurred while updating profile" });
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader subheader="The information can be edited" title="Profile" />
				<Divider />
				<CardContent>
					{message && (
						<Alert severity={message.type} sx={{ mb: 2 }}>
							{message.text}
						</Alert>
					)}
					<Grid container spacing={3}>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth required>
								<InputLabel>Username</InputLabel>
								<OutlinedInput
									value={formData.username}
									onChange={handleInputChange("username")}
									label="Username"
									name="username"
								/>
							</FormControl>
						</Grid>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth>
								<InputLabel>Last name</InputLabel>
								<OutlinedInput
									value={formData.lastName}
									onChange={handleInputChange("lastName")}
									label="Last name"
									name="lastName"
								/>
							</FormControl>
						</Grid>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth required>
								<InputLabel>Email address</InputLabel>
								<OutlinedInput
									value={formData.email}
									onChange={handleInputChange("email")}
									label="Email address"
									name="email"
									type="email"
								/>
							</FormControl>
						</Grid>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth>
								<InputLabel>Phone number</InputLabel>
								<OutlinedInput
									value={formData.phone}
									onChange={handleInputChange("phone")}
									label="Phone number"
									name="phone"
									type="tel"
								/>
							</FormControl>
						</Grid>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth error={Boolean(passwordError && formData.newPassword)}>
								<InputLabel>Change Password</InputLabel>
								<OutlinedInput
									value={formData.newPassword}
									onChange={handleInputChange("newPassword")}
									label="Change Password"
									name="newPassword"
									type={showNewPassword ? "text" : "password"}
									endAdornment={
										showNewPassword ? (
											<EyeIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowNewPassword(false)}
											/>
										) : (
											<EyeSlashIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowNewPassword(true)}
											/>
										)
									}
								/>
								{passwordError && formData.newPassword && <FormHelperText>{passwordError}</FormHelperText>}
							</FormControl>
						</Grid>
						<Grid
							size={{
								md: 6,
								xs: 12,
							}}
						>
							<FormControl fullWidth error={Boolean(passwordError && formData.confirmPassword)}>
								<InputLabel>Confirm Password</InputLabel>
								<OutlinedInput
									value={formData.confirmPassword}
									onChange={handleInputChange("confirmPassword")}
									label="Confirm Password"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									endAdornment={
										showConfirmPassword ? (
											<EyeIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowConfirmPassword(false)}
											/>
										) : (
											<EyeSlashIcon
												cursor="pointer"
												fontSize="var(--icon-fontSize-md)"
												onClick={() => setShowConfirmPassword(true)}
											/>
										)
									}
								/>
								{passwordError && formData.confirmPassword && <FormHelperText>{passwordError}</FormHelperText>}
							</FormControl>
						</Grid>
					</Grid>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button
						variant="contained"
						type="submit"
						disabled={isLoading || Boolean(passwordError)}
						startIcon={isLoading ? <CircularProgress size={20} /> : null}
					>
						{isLoading ? "Saving..." : "Save details"}
					</Button>
				</CardActions>
			</Card>
		</form>
	);
}
