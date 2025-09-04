"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { UserPlus as UserPlusIcon } from "@phosphor-icons/react/dist/ssr/UserPlus";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

export default function RoleRequestPage(): React.JSX.Element {
	const { user } = useUser();
	const [requestStatus, setRequestStatus] = useState<string | null>(null);
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);
	const [checkingStatus, setCheckingStatus] = useState(true);

	// Check current request status
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const response = await apiClient.getRoleChangeStatus();
				if (response.success && response.data) {
					setRequestStatus(response.data.status);
				}
			} catch (error) {
				console.error("Error checking status:", error);
				// If there's an error, assume no request exists
				setRequestStatus(null);
			} finally {
				setCheckingStatus(false);
			}
		};

		checkStatus();
	}, []);

	const handleSubmitRequest = async () => {
		if (!reason.trim()) {
			toast.error("Please provide a reason for your request");
			return;
		}

		setLoading(true);
		try {
			const response = await apiClient.createRoleChangeRequest({
				requestedRole: 2, // Legal Officer
				reason: reason.trim(),
			});

			if (response.success) {
				toast.success("Role change request submitted successfully!");
				setRequestStatus("pending");
				setReason("");
			} else {
				toast.error(response.error || "Failed to submit request");
			}
		} catch (error) {
			console.error("Error submitting request:", error);
			toast.error("Failed to submit request");
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "warning";
			case "approved":
				return "success";
			case "rejected":
				return "error";
			default:
				return "default";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "pending":
				return "Pending Review";
			case "approved":
				return "Approved - You are now a Legal Officer!";
			case "rejected":
				return "Rejected";
			default:
				return "No Request";
		}
	};

	if (checkingStatus) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Role Change Request</Typography>
				<Typography color="text.secondary" variant="body1">
					Request to become a Legal Officer
				</Typography>
			</Stack>

			{/* Current Status */}
			<Card>
				<CardContent>
					<Stack spacing={2}>
						<Typography variant="h6">Current Status</Typography>
						<Stack direction="row" spacing={2} alignItems="center">
							<Chip
								label={getStatusText(requestStatus || "none")}
								color={getStatusColor(requestStatus || "none") as any}
								variant="outlined"
							/>
							{requestStatus === "pending" && (
								<Typography variant="body2" color="text.secondary">
									Your request is being reviewed by administrators
								</Typography>
							)}
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Request Form - Only show if no request exists or previous was rejected */}
			{(!requestStatus || requestStatus === "rejected") && (
				<Card>
					<CardContent>
						<Stack spacing={3}>
							<Typography variant="h6">Submit New Request</Typography>
							<Typography variant="body2" color="text.secondary">
								Explain why you want to become a Legal Officer and how you can contribute to the system.
							</Typography>

							<TextField
								label="Reason for Request"
								multiline
								rows={4}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Describe your qualifications, experience, and motivation for becoming a Legal Officer..."
								fullWidth
							/>

							<Stack direction="row" spacing={2}>
								<Button
									variant="contained"
									startIcon={<UserPlusIcon />}
									onClick={handleSubmitRequest}
									disabled={loading || !reason.trim()}
								>
									{loading ? "Submitting..." : "Submit Request"}
								</Button>
								<Button variant="outlined" onClick={() => setReason("")} disabled={loading}>
									Clear
								</Button>
							</Stack>
						</Stack>
					</CardContent>
				</Card>
			)}

			{/* Information */}
			<Card>
				<CardContent>
					<Stack spacing={2}>
						<Typography variant="h6">About Legal Officer Role</Typography>
						<Typography variant="body2" color="text.secondary">
							Legal Officers have additional privileges including:
						</Typography>
						<Box component="ul" sx={{ pl: 2 }}>
							<Typography component="li" variant="body2" color="text.secondary">
								Enhanced access to legal case management
							</Typography>
							<Typography component="li" variant="body2" color="text.secondary">
								Ability to review and process scam reports
							</Typography>
							<Typography component="li" variant="body2" color="text.secondary">
								Access to additional administrative tools
							</Typography>
						</Box>
					</Stack>
				</CardContent>
			</Card>
		</Stack>
	);
}
