"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface User {
	userid: number;
	username: string;
	email: string;
	contact?: string;
	profilepic?: string;
	roles: number;
	created_at: string;
	updated_at: string;
	hasPendingRoleRequest: boolean;
	pendingRoleRequest?: {
		id: number;
		status: string;
		reason: string;
		createdAt: string;
	} | null;
}

// Hook to fetch users from backend
function useUsers() {
	const [users, setUsers] = React.useState<User[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [total, setTotal] = React.useState(0);

	const fetchUsers = React.useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiClient.getUsers({
				page: page + 1,
				limit: rowsPerPage,
			});

			if (response.success && response.data) {
				setUsers(response.data.users || []);
				setTotal(response.data.pagination?.total || 0);
			} else {
				setError(response.error || "Failed to fetch users");
			}
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	}, [page, rowsPerPage]);

	React.useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return {
		users,
		loading,
		error,
		page,
		setPage,
		rowsPerPage,
		setRowsPerPage,
		total,
		refetch: fetchUsers,
	};
}

// Helper function to get role name
const getRoleName = (roleNumber: number): string => {
	switch (roleNumber) {
		case 1:
			return "Admin";
		case 2:
			return "Legal Officer";
		case 3:
			return "User";
		default:
			return "User";
	}
};

// Helper function to get role color
const getRoleColor = (
	roleNumber: number
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
	switch (roleNumber) {
		case 1:
			return "error";
		case 2:
			return "primary";
		case 3:
			return "default";
		default:
			return "default";
	}
};

interface UsersTableProps {
	count?: number;
	page?: number;
	rows?: User[];
	rowsPerPage?: number;
}

export function UsersTable({ count, page, rows, rowsPerPage }: UsersTableProps): React.JSX.Element {
	const { user: currentUser } = useUser();
	const {
		users,
		loading,
		error,
		page: currentPage,
		setPage,
		rowsPerPage: currentRowsPerPage,
		setRowsPerPage,
		total,
		refetch,
	} = useUsers();

	// Role change request dialog state
	const [roleChangeDialog, setRoleChangeDialog] = React.useState<{
		open: boolean;
		user: User | null;
		action: "approve" | "reject" | null;
		adminNotes: string;
	}>({
		open: false,
		user: null,
		action: null,
		adminNotes: "",
	});

	// Handle role change approval/rejection
	const handleRoleChange = async (action: "approve" | "reject") => {
		if (!roleChangeDialog.user || !roleChangeDialog.user.pendingRoleRequest) return;

		try {
			let response;
			if (action === "approve") {
				response = await apiClient.approveRoleChangeRequest(
					roleChangeDialog.user.pendingRoleRequest.id.toString(),
					roleChangeDialog.adminNotes || "Approved by admin"
				);
			} else {
				response = await apiClient.rejectRoleChangeRequest(
					roleChangeDialog.user.pendingRoleRequest.id.toString(),
					roleChangeDialog.adminNotes
				);
			}

			if (response.success) {
				// Close dialog and refresh users
				setRoleChangeDialog({
					open: false,
					user: null,
					action: null,
					adminNotes: "",
				});
				refetch();
			} else {
				console.error("Failed to process role change:", response.error);
			}
		} catch (err) {
			console.error("Error processing role change:", err);
		}
	};

	// Open role change dialog
	const openRoleChangeDialog = (user: User, action: "approve" | "reject") => {
		setRoleChangeDialog({
			open: true,
			user,
			action,
			adminNotes: "",
		});
	};

	// Close role change dialog
	const closeRoleChangeDialog = () => {
		setRoleChangeDialog({
			open: false,
			user: null,
			action: null,
			adminNotes: "",
		});
	};

	if (loading) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography>Loading users...</Typography>
				</Box>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography color="error">{error}</Typography>
				</Box>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>User</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Contact</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Joined</TableCell>
							<TableCell>Role Request</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.userid} hover>
								<TableCell>
									<Stack direction="row" spacing={2} alignItems="center">
										<Avatar
											src={user.profilepic ? `http://localhost:5000${user.profilepic}` : undefined}
											alt={user.username}
											sx={{
												bgcolor: user.profilepic ? "transparent" : "primary.main",
												color: user.profilepic ? "inherit" : "white",
												fontWeight: "bold",
											}}
											onError={(e) => {
												// If image fails to load, fall back to initials
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												target.nextElementSibling?.setAttribute("style", "display: block");
											}}
										>
											{user.username.charAt(0).toUpperCase()}
										</Avatar>
										<Box>
											<Typography variant="subtitle2">{user.username}</Typography>
											<Typography variant="body2" color="text.secondary">
												ID: {user.userid}
											</Typography>
										</Box>
									</Stack>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.contact || "N/A"}</TableCell>
								<TableCell>
									<Chip label={getRoleName(user.roles)} color={getRoleColor(user.roles)} size="small" />
								</TableCell>
								<TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
								<TableCell>
									{user.hasPendingRoleRequest ? (
										<Chip label="Pending Request" color="warning" size="small" />
									) : (
										<Typography variant="body2" color="text.secondary">
											No request
										</Typography>
									)}
								</TableCell>
								<TableCell>
									<Stack direction="row" spacing={1}>
										<IconButton size="small" title="View Details">
											<EyeIcon fontSize="var(--icon-fontSize-md)" />
										</IconButton>

										{user.hasPendingRoleRequest && currentUser?.roles === 1 && (
											<>
												<Button
													size="small"
													variant="contained"
													color="success"
													startIcon={<CheckIcon />}
													onClick={() => openRoleChangeDialog(user, "approve")}
												>
													Approve
												</Button>
												<Button
													size="small"
													variant="contained"
													color="error"
													startIcon={<XIcon />}
													onClick={() => openRoleChangeDialog(user, "reject")}
												>
													Reject
												</Button>
											</>
										)}
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<TablePagination
					component="div"
					count={total}
					page={currentPage}
					rowsPerPage={currentRowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
				/>
			</Card>

			{/* Role Change Request Dialog */}
			<Dialog open={roleChangeDialog.open} onClose={closeRoleChangeDialog} maxWidth="sm" fullWidth>
				<DialogTitle>{roleChangeDialog.action === "approve" ? "Approve" : "Reject"} Role Change Request</DialogTitle>
				<DialogContent>
					{roleChangeDialog.user && (
						<Stack spacing={2} sx={{ mt: 1 }}>
							<Typography variant="body2">
								<strong>User:</strong> {roleChangeDialog.user.username} ({roleChangeDialog.user.email})
							</Typography>
							<Typography variant="body2">
								<strong>Current Role:</strong> {getRoleName(roleChangeDialog.user.roles)}
							</Typography>
							<Typography variant="body2">
								<strong>Requested Role:</strong> Legal Officer
							</Typography>
							{roleChangeDialog.user.pendingRoleRequest?.reason && (
								<Typography variant="body2">
									<strong>Reason:</strong> {roleChangeDialog.user.pendingRoleRequest.reason}
								</Typography>
							)}
							<TextField
								label="Admin Notes"
								multiline
								rows={3}
								fullWidth
								value={roleChangeDialog.adminNotes}
								onChange={(e) => setRoleChangeDialog((prev) => ({ ...prev, adminNotes: e.target.value }))}
								placeholder={
									roleChangeDialog.action === "approve" ? "Optional notes for approval" : "Required notes for rejection"
								}
								required={roleChangeDialog.action === "reject"}
							/>
						</Stack>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={closeRoleChangeDialog}>Cancel</Button>
					<Button
						onClick={() => handleRoleChange(roleChangeDialog.action!)}
						variant="contained"
						color={roleChangeDialog.action === "approve" ? "success" : "error"}
						disabled={roleChangeDialog.action === "reject" && !roleChangeDialog.adminNotes.trim()}
					>
						{roleChangeDialog.action === "approve" ? "Approve" : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
