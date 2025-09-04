"use client";

import { useEffect, useState } from "react";
import {
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
	TextField,
	Typography,
} from "@mui/material";

import { apiClient } from "@/lib/api-client";

interface ScamReportFormDialogProps {
	open: boolean;
	onClose: () => void;
	editingReport: any;
	onSuccess?: () => void; // Callback to refresh table
}

interface ScamReportFormData {
	title: string;
	description: string;
	scammerInfo: string;
	platform: string;
}

const platformOptions = [
	"Facebook",
	"Instagram",
	"WhatsApp",
	"Telegram",
	"Email",
	"Phone Call",
	"SMS",
	"Website",
	"Other",
];

export function ScamReportFormDialog({ open, onClose, editingReport, onSuccess }: ScamReportFormDialogProps) {
	const [formData, setFormData] = useState<ScamReportFormData>({
		title: "",
		description: "",
		scammerInfo: "",
		platform: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (editingReport) {
			setFormData({
				title: editingReport.title || "",
				description: editingReport.description || "",
				scammerInfo: editingReport.scammerInfo || "",
				platform: editingReport.platform || "",
			});
		} else {
			setFormData({
				title: "",
				description: "",
				scammerInfo: "",
				platform: "",
			});
		}
		setError(null);
	}, [editingReport, open]);

	const handleInputChange = (field: keyof ScamReportFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async () => {
		if (!formData.title || !formData.description || !formData.scammerInfo || !formData.platform) {
			setError("Please fill in all required fields");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			if (editingReport) {
				// Update existing report
				const response = await apiClient.put(`/scam-reports/${editingReport.id}`, formData);
				if (response.success) {
					onClose();
					onSuccess?.(); // Refresh table
				} else {
					setError(response.error || "Failed to update report");
				}
			} else {
				// Create new report
				const response = await apiClient.post("/scam-reports", formData);
				if (response.success) {
					onClose();
					onSuccess?.(); // Refresh table
				} else {
					setError(response.error || "Failed to create report");
				}
			}
		} catch (err) {
			console.error("Error submitting report:", err);
			setError("An error occurred while submitting the report");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>{editingReport ? "Edit Scam Report" : "Create New Scam Report"}</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ mt: 2 }}>
					<TextField
						label="Report Title"
						value={formData.title}
						onChange={(e) => handleInputChange("title", e.target.value)}
						fullWidth
						required
						placeholder="Brief description of the scam"
					/>

					<TextField
						label="Description"
						value={formData.description}
						onChange={(e) => handleInputChange("description", e.target.value)}
						fullWidth
						required
						multiline
						rows={4}
						placeholder="Detailed description of what happened"
					/>

					<TextField
						label="Scammer Information"
						value={formData.scammerInfo}
						onChange={(e) => handleInputChange("scammerInfo", e.target.value)}
						fullWidth
						required
						multiline
						rows={3}
						placeholder="Any information about the scammer (phone, email, social media handles, etc.)"
					/>

					<FormControl fullWidth required>
						<InputLabel>Platform</InputLabel>
						<Select
							value={formData.platform}
							label="Platform"
							onChange={(e) => handleInputChange("platform", e.target.value)}
						>
							{platformOptions.map((platform) => (
								<MenuItem key={platform} value={platform}>
									{platform}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{error && (
						<Typography color="error" variant="body2">
							{error}
						</Typography>
					)}
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} variant="contained" disabled={loading}>
					{loading ? "Saving..." : editingReport ? "Update Report" : "Create Report"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
