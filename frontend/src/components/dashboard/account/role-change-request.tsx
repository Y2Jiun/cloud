"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { Scales as ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface RoleChangeRequest {
	id: number;
	status: string;
	reason: string;
	createdAt: string;
	adminNotes?: string;
}

export function RoleChangeRequest(): React.JSX.Element {
	const { user: currentUser } = useUser();
	const [roleChangeRequest, setRoleChangeRequest] = React.useState<RoleChangeRequest | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [reason, setReason] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState<string | null>(null);

	// Check if user can request role change
	const canRequestRoleChange = currentUser && currentUser.roles === 3; // Only regular users can request

	// Fetch current role change request status
	React.useEffect(() => {
		if (!currentUser) return;

		async function fetchRoleChangeStatus() {
			try {
				const response = await apiClient.getRoleChangeStatus();
				if (response.success && response.data) {
					setRoleChangeRequest(response.data);
				}
			} catch (err) {
				console.error("Error fetching role change status:", err);
			}
		}

		fetchRoleChangeStatus();
	}, [currentUser]);

	// Handle role change request submission
	const handleSubmitRequest = async () => {
		if (!reason.trim()) {
			setError("Please provide a reason for your role change request");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await apiClient.requestRoleChange(reason.trim());

			if (response.success) {
				setSuccess("Role change request submitted successfully!");
				setRoleChangeRequest(response.data);
				setDialogOpen(false);
				setReason("");
			} else {
				setError(response.error || "Failed to submit role change request");
			}
		} catch (err) {
			console.error("Error submitting role change request:", err);
			setError("Failed to submit role change request");
		} finally {
			setLoading(false);
		}
	};

	// Get status display info
	const getStatusInfo = (status: string) => {
		switch (status) {
			case "pending":
				return {
					label: "Pending Review",
					color: "warning" as const,
					icon: <ClockIcon />,
					description: "Your request is being reviewed by an administrator",
				};
			case "approved":
				return {
					label: "Approved",
					color: "success" as const,
					icon: <CheckIcon />,
					description: "Your request has been approved! You are now a Legal Officer",
				};
			case "rejected":
				return {
					label: "Rejected",
					color: "error" as const,
					icon: <XIcon />,
					description: "Your request was not approved",
				};
			default:
				return {
					label: "Unknown",
					color: "default" as const,
					icon: null,
					description: "Unknown status",
				};
		}
	};

	if (!canRequestRoleChange) {
		return null; // Don't show for non-users
	}

	return (
		<>
			<Card>
				<CardHeader
					title="Legal Officer Role Request"
					subheader="Request to become a Legal Officer to manage legal cases and evidence"
					avatar={<ScalesIcon fontSize="var(--icon-fontSize-lg)" />}
				/>
				<CardContent>
					{success && (
						<Alert severity="success" sx={{ mb: 2 }}>
							{success}
						</Alert>
					)}

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{roleChangeRequest ? (
						<Stack spacing={2}>
							<Box>
								<Typography variant="h6" gutterBottom>
									Request Status
								</Typography>
								<Chip
									label={getStatusInfo(roleChangeRequest.status).label}
									color={getStatusInfo(roleChangeRequest.status).color}
									icon={getStatusInfo(roleChangeRequest.status).icon}
									size="medium"
								/>
							</Box>

							<Typography variant="body2" color="text.secondary">
								{getStatusInfo(roleChangeRequest.status).description}
							</Typography>

							<Box>
								<Typography variant="subtitle2" gutterBottom>
									Your Reason:
								</Typography>
								<Typography variant="body2" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
									{roleChangeRequest.reason}
								</Typography>
							</Box>

							{roleChangeRequest.adminNotes && (
								<Box>
									<Typography variant="subtitle2" gutterBottom>
										Admin Notes:
									</Typography>
									<Typography variant="body2" sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
										{roleChangeRequest.adminNotes}
									</Typography>
								</Box>
							)}

							<Typography variant="caption" color="text.secondary">
								Submitted on: {new Date(roleChangeRequest.createdAt).toLocaleDateString()}
							</Typography>

							{roleChangeRequest.status === "rejected" && (
								<Button variant="contained" onClick={() => setDialogOpen(true)} startIcon={<ScalesIcon />}>
									Submit New Request
								</Button>
							)}
						</Stack>
					) : (
						<Stack spacing={2}>
							<Typography variant="body2" color="text.secondary">
								As a Legal Officer, you will be able to:
							</Typography>
							<Box component="ul" sx={{ pl: 2 }}>
								<Typography component="li" variant="body2">
									Create and manage legal cases
								</Typography>
								<Typography component="li" variant="body2">
									Upload and organize evidence
								</Typography>
								<Typography component="li" variant="body2">
									Investigate scam reports
								</Typography>
								<Typography component="li" variant="body2">
									Access advanced legal tools
								</Typography>
							</Box>

							<Button
								variant="contained"
								onClick={() => setDialogOpen(true)}
								startIcon={<ScalesIcon />}
								disabled={loading}
							>
								Request Legal Officer Role
							</Button>
						</Stack>
					)}
				</CardContent>
			</Card>

			{/* Role Change Request Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Request Legal Officer Role</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Please provide a reason for why you want to become a Legal Officer. This will help administrators evaluate
							your request.
						</Typography>

						<TextField
							label="Reason for Role Change"
							multiline
							rows={4}
							fullWidth
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Explain why you want to become a Legal Officer..."
							required
							error={!!error}
							helperText={error}
						/>

						<Alert severity="info">
							<Typography variant="body2">
								<strong>Note:</strong> Your request will be reviewed by an administrator. You will be notified of the
								decision via email and in this dashboard.
							</Typography>
						</Alert>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleSubmitRequest} variant="contained" disabled={loading || !reason.trim()}>
						{loading ? "Submitting..." : "Submit Request"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
