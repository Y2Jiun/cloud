"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Stack,
	Typography,
	Chip,
	Box,
} from "@mui/material";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";

interface StatusManagementDialogProps {
	open: boolean;
	onClose: () => void;
	reportId: string;
	currentStatus: "pending" | "investigating" | "resolved" | "dismissed";
	reportTitle: string;
	onStatusUpdated?: () => void;
}

const statusOptions = [
	{ value: "pending", label: "Pending", color: "default" },
	{ value: "investigating", label: "Investigating", color: "warning" },
	{ value: "resolved", label: "Resolved", color: "success" },
	{ value: "dismissed", label: "Dismissed", color: "error" },
] as const;

export function StatusManagementDialog({
	open,
	onClose,
	reportId,
	currentStatus,
	reportTitle,
	onStatusUpdated,
}: StatusManagementDialogProps): React.JSX.Element {
	const [newStatus, setNewStatus] = React.useState(currentStatus);
	const [notes, setNotes] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	// Reset form when dialog opens
	React.useEffect(() => {
		if (open) {
			setNewStatus(currentStatus);
			setNotes("");
		}
	}, [open, currentStatus]);

	const handleSubmit = async () => {
		if (newStatus === currentStatus && !notes.trim()) {
			toast.error("Please select a different status or add notes");
			return;
		}

		setIsSubmitting(true);

		try {
			const updateData: any = {};
			
			if (newStatus !== currentStatus) {
				updateData.status = newStatus;
			}
			
			if (notes.trim()) {
				updateData.adminNotes = notes.trim();
			}

			const response = await apiClient.updateScamReport(reportId, updateData);

			if (response.success) {
				toast.success("Report status updated successfully!");
				onStatusUpdated?.();
				onClose();
			} else {
				throw new Error(response.error || "Failed to update report status");
			}
		} catch (error: any) {
			console.error("Error updating report status:", error);
			toast.error(error.message || "Failed to update report status");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusColor = (status: string) => {
		const option = statusOptions.find((opt) => opt.value === status);
		return option?.color || "default";
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Stack spacing={1}>
					<Typography variant="h6">Manage Report Status</Typography>
					<Typography variant="body2" color="text.secondary">
						{reportTitle}
					</Typography>
				</Stack>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={3} sx={{ mt: 1 }}>
					{/* Current Status */}
					<Box>
						<Typography variant="subtitle2" gutterBottom>
							Current Status
						</Typography>
						<Chip
							color={getStatusColor(currentStatus) as any}
							label={currentStatus.toUpperCase()}
							size="small"
						/>
					</Box>

					{/* New Status Selection */}
					<FormControl fullWidth>
						<InputLabel>New Status</InputLabel>
						<Select
							value={newStatus}
							label="New Status"
							onChange={(e) => setNewStatus(e.target.value as any)}
						>
							{statusOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
										<Chip
											color={option.color as any}
											label={option.label}
											size="small"
											variant="outlined"
										/>
									</Stack>
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Admin Notes */}
					<TextField
						label="Admin Notes (Optional)"
						multiline
						rows={4}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Add any notes about this status change..."
						helperText="These notes will be logged for audit purposes"
					/>

					{/* Status Change Preview */}
					{newStatus !== currentStatus && (
						<Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
							<Typography variant="subtitle2" gutterBottom>
								Status Change Preview
							</Typography>
							<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
								<Chip
									color={getStatusColor(currentStatus) as any}
									label={currentStatus.toUpperCase()}
									size="small"
								/>
								<Typography variant="body2">→</Typography>
								<Chip
									color={getStatusColor(newStatus) as any}
									label={newStatus.toUpperCase()}
									size="small"
								/>
							</Stack>
						</Box>
					)}
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={isSubmitting || (newStatus === currentStatus && !notes.trim())}
				>
					{isSubmitting ? "Updating..." : "Update Status"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
