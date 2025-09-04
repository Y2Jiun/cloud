"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { CheckCircle as ApproveIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { XCircle as RejectIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface RoleChangeRequest {
	id: string;
	userId: number;
	requestedRole: number;
	reason: string;
	status: "pending" | "approved" | "rejected";
	adminNotes?: string;
	createdAt: Date;
	user: {
		username: string;
		name: string;
		email: string;
		currentRole: number;
	};
}

export default function AdminRoleRequestsPage(): React.JSX.Element {
	const { user } = useUser();
	const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState<"approve" | "reject">("approve");
	const [adminNotes, setAdminNotes] = useState("");
	const [processing, setProcessing] = useState(false);

	// Check if user is admin
	if (user?.roles !== 1) {
		return (
			<Stack spacing={3}>
				<Typography variant="h4" color="error">
					Access Denied. Only administrators can view this page.
				</Typography>
			</Stack>
		);
	}

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			const response = await apiClient.getAllRoleChangeRequests();
			if (response.success && response.data) {
				const transformedRequests = response.data.map((req: any) => ({
					...req,
					id: req.id.toString(),
					createdAt: new Date(req.createdAt),
				}));
				setRequests(transformedRequests);
			} else {
				toast.error(response.error || "Failed to fetch requests");
			}
		} catch (error) {
			console.error("Error fetching requests:", error);
			toast.error("Failed to fetch requests");
		} finally {
			setLoading(false);
		}
	};

	const handleAction = (request: RoleChangeRequest, type: "approve" | "reject") => {
		setSelectedRequest(request);
		setActionType(type);
		setAdminNotes("");
		setActionDialogOpen(true);
	};

	const handleSubmitAction = async () => {
		if (!selectedRequest) return;

		if (actionType === "reject" && !adminNotes.trim()) {
			toast.error("Please provide rejection notes");
			return;
		}

		setProcessing(true);
		try {
			let response;
			if (actionType === "approve") {
				response = await apiClient.approveRoleChangeRequest(selectedRequest.id, adminNotes);
			} else {
				response = await apiClient.rejectRoleChangeRequest(selectedRequest.id, adminNotes);
			}

			if (response.success) {
				toast.success(`Request ${actionType}d successfully!`);
				setActionDialogOpen(false);
				fetchRequests(); // Refresh the list
			} else {
				toast.error(response.error || `Failed to ${actionType} request`);
			}
		} catch (error) {
			console.error(`Error ${actionType}ing request:`, error);
			toast.error(`Failed to ${actionType} request`);
		} finally {
			setProcessing(false);
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

	const getRoleText = (role: number) => {
		switch (role) {
			case 1:
				return "Admin";
			case 2:
				return "Legal Officer";
			case 3:
				return "User";
			default:
				return "Unknown";
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			<Stack spacing={3}>
				<Stack spacing={1}>
					<Typography variant="h4">Role Change Requests</Typography>
					<Typography color="text.secondary" variant="body1">
						Review and manage user requests to become Legal Officers
					</Typography>
				</Stack>

				<Card>
					<CardContent>
						{requests.length === 0 ? (
							<Box sx={{ textAlign: "center", py: 4 }}>
								<Typography color="text.secondary">No role change requests found</Typography>
							</Box>
						) : (
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>User</TableCell>
										<TableCell>Current Role</TableCell>
										<TableCell>Requested Role</TableCell>
										<TableCell>Reason</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Date</TableCell>
										<TableCell>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{requests.map((request) => (
										<TableRow key={request.id}>
											<TableCell>
												<Stack spacing={0.5}>
													<Typography variant="subtitle2">{request.user.name}</Typography>
													<Typography variant="body2" color="text.secondary">
														{request.user.email}
													</Typography>
												</Stack>
											</TableCell>
											<TableCell>
												<Chip label={getRoleText(request.user.currentRole)} size="small" variant="outlined" />
											</TableCell>
											<TableCell>
												<Chip label={getRoleText(request.requestedRole)} size="small" color="primary" />
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{request.reason.length > 50 ? `${request.reason.substring(0, 50)}...` : request.reason}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip label={request.status} color={getStatusColor(request.status) as any} size="small" />
											</TableCell>
											<TableCell>
												<Typography variant="body2">{request.createdAt.toLocaleDateString()}</Typography>
											</TableCell>
											<TableCell>
												<Stack direction="row" spacing={1}>
													<IconButton
														size="small"
														title="View Details"
														onClick={() => {
															setSelectedRequest(request);
															setActionType("approve");
															setActionDialogOpen(true);
														}}
													>
														<EyeIcon />
													</IconButton>
													{request.status === "pending" && (
														<>
															<IconButton
																size="small"
																title="Approve Request"
																onClick={() => handleAction(request, "approve")}
																sx={{ color: "success.main" }}
															>
																<ApproveIcon />
															</IconButton>
															<IconButton
																size="small"
																title="Reject Request"
																onClick={() => handleAction(request, "reject")}
																sx={{ color: "error.main" }}
															>
																<RejectIcon />
															</IconButton>
														</>
													)}
												</Stack>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</Stack>

			{/* Action Dialog */}
			<Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Role Change Request</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 2 }}>
						{selectedRequest && (
							<>
								<Box>
									<Typography variant="subtitle2" gutterBottom>
										User Details
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Name: {selectedRequest.user.name}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Email: {selectedRequest.user.email}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Current Role: {getRoleText(selectedRequest.user.currentRole)}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Requested Role: {getRoleText(selectedRequest.requestedRole)}
									</Typography>
								</Box>

								<Box>
									<Typography variant="subtitle2" gutterBottom>
										User's Reason
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{selectedRequest.reason}
									</Typography>
								</Box>
							</>
						)}

						<TextField
							label={actionType === "approve" ? "Admin Notes (Optional)" : "Rejection Reason *"}
							multiline
							rows={3}
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder={
								actionType === "approve"
									? "Add any notes about this approval..."
									: "Explain why this request is being rejected..."
							}
							fullWidth
							required={actionType === "reject"}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setActionDialogOpen(false)} disabled={processing}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmitAction}
						variant="contained"
						color={actionType === "approve" ? "success" : "error"}
						disabled={processing || (actionType === "reject" && !adminNotes.trim())}
					>
						{processing ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}




