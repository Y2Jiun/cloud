"use client";

import * as React from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import type { Notification } from "./notifications-table";

interface NotificationFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<Notification>) => void;
	notification?: Notification | null;
}

export function NotificationFormDialog({
	open,
	onClose,
	onSubmit,
	notification,
}: NotificationFormDialogProps): React.JSX.Element {
	const [formData, setFormData] = React.useState({
		title: "",
		description: "",
		roles: 3, // 1=User, 2=Legal Officer Only, 3=All Users
		type: 1, // 1=Notification, 2=Announcement, 3=Alert
		priority: "medium" as const,
		status: "active" as const,
		expiresAt: null as Date | null,
	});

	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// Reset form when dialog opens/closes or notification changes
	React.useEffect(() => {
		if (open) {
			if (notification) {
				setFormData({
					title: notification.title,
					description: notification.description,
					roles: notification.roles,
					type: notification.type,
					priority: notification.priority,
					status: notification.status,
					expiresAt: notification.expiresAt || null,
				});
			} else {
				setFormData({
					title: "",
					description: "",
					roles: 3,
					type: 1,
					priority: "medium",
					status: "active",
					expiresAt: null,
				});
			}
			setErrors({});
		}
	}, [open, notification]);

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Description is required";
		}

		if (formData.expiresAt && formData.expiresAt <= new Date()) {
			newErrors.expiresAt = "Expiration date must be in the future";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}

		onSubmit(formData);
	};

	const isEditing = !!notification;

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogTitle>{isEditing ? "Edit Notification" : "Create New Notification"}</DialogTitle>

				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						{/* Title */}
						<TextField
							label="Title"
							value={formData.title}
							onChange={(e) => handleChange("title", e.target.value)}
							error={!!errors.title}
							helperText={errors.title}
							fullWidth
							required
						/>

						{/* Description */}
						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) => handleChange("description", e.target.value)}
							error={!!errors.description}
							helperText={errors.description}
							multiline
							rows={4}
							fullWidth
							required
						/>

						{/* Roles and Type */}
						<Stack direction="row" spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Roles</InputLabel>
								<Select value={formData.roles} label="Roles" onChange={(e) => handleChange("roles", e.target.value)}>
									<MenuItem value={1}>User Only</MenuItem>
									<MenuItem value={2}>Legal Officer Only</MenuItem>
									<MenuItem value={3}>All Users</MenuItem>
								</Select>
							</FormControl>

							<FormControl fullWidth>
								<InputLabel>Type</InputLabel>
								<Select value={formData.type} label="Type" onChange={(e) => handleChange("type", e.target.value)}>
									<MenuItem value={1}>Notification</MenuItem>
									<MenuItem value={2}>Announcement</MenuItem>
									<MenuItem value={3}>Alert</MenuItem>
								</Select>
							</FormControl>
						</Stack>

						{/* Priority and Status */}
						<Stack direction="row" spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Priority</InputLabel>
								<Select
									value={formData.priority}
									label="Priority"
									onChange={(e) => handleChange("priority", e.target.value)}
								>
									<MenuItem value="low">Low</MenuItem>
									<MenuItem value="medium">Medium</MenuItem>
									<MenuItem value="high">High</MenuItem>
									<MenuItem value="urgent">Urgent</MenuItem>
								</Select>
							</FormControl>

							<FormControl fullWidth>
								<InputLabel>Status</InputLabel>
								<Select value={formData.status} label="Status" onChange={(e) => handleChange("status", e.target.value)}>
									<MenuItem value="active">Active</MenuItem>
									<MenuItem value="inactive">Inactive</MenuItem>
									<MenuItem value="expired">Expired</MenuItem>
								</Select>
							</FormControl>
						</Stack>

						{/* Expiration Date */}
						<FormControl fullWidth>
							<DateTimePicker
								label="Expiration Date (Optional)"
								value={formData.expiresAt}
								onChange={(date) => handleChange("expiresAt", date)}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.expiresAt,
										helperText: errors.expiresAt || "Leave empty for no expiration",
									},
								}}
							/>
						</FormControl>
					</Stack>
				</DialogContent>

				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button onClick={handleSubmit} variant="contained">
						{isEditing ? "Update" : "Create"} Notification
					</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
}
