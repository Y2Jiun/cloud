"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
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
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useSelection } from "@/hooks/use-selection";
import { useUser } from "@/hooks/use-user";

function noop(): void {
	// do nothing
}

export interface ScamAlert {
	id: string;
	title: string;
	description: string;
	severity: "HIGH" | "MEDIUM" | "LOW";
	targetAudience: "ALL" | "SPECIFIC_GROUPS";
	status: "pending" | "approved" | "rejected";
	adminNotes?: string;
	isActive: boolean;
	expiresAt?: Date;
	createdBy: number;
	approvedBy?: number;
	createdAt: Date;
	updatedAt: Date;
	createdByUser: {
		username: string;
		name?: string;
		email: string;
	};
	approvedByUser?: {
		username: string;
		name?: string;
		email: string;
	};
}

// Hook to fetch scam alerts from backend
function useScamAlerts() {
	const { user } = useUser();
	const [alerts, setAlerts] = React.useState<ScamAlert[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchAlerts = React.useCallback(async () => {
		try {
			setLoading(true);
			let response;

			// Different API calls based on user role
			if (user?.roles === 1) {
				// Admin - see all alerts
				response = await apiClient.getScamAlerts();
			} else if (user?.roles === 2) {
				// Legal Officer - see own alerts + approved
				response = await apiClient.getScamAlerts();
			} else {
				// Regular user - see only approved alerts
				response = await apiClient.getScamAlerts({ status: "approved" });
			}

			if (response.success && response.data) {
				// Transform backend data to frontend format
				const transformedAlerts: ScamAlert[] = response.data.map((alert: any) => ({
					id: alert.id.toString(),
					title: alert.title,
					description: alert.description,
					severity: alert.severity,
					targetAudience: alert.targetAudience,
					status: alert.status,
					adminNotes: alert.adminNotes,
					isActive: alert.isActive,
					expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
					createdBy: alert.createdBy,
					approvedBy: alert.approvedBy,
					createdAt: new Date(alert.createdAt),
					updatedAt: new Date(alert.updatedAt),
					createdByUser: alert.createdByUser,
					approvedByUser: alert.approvedByUser,
				}));

				setAlerts(transformedAlerts);
			} else {
				setError(response.error || "Failed to fetch alerts");
			}
		} catch (err) {
			console.error("Error fetching scam alerts:", err);
			setError("Failed to fetch alerts");
		} finally {
			setLoading(false);
		}
	}, [user?.roles]);

	React.useEffect(() => {
		fetchAlerts();
	}, [fetchAlerts]);

	return { alerts, loading, error, refetch: fetchAlerts };
}

interface ScamAlertsTableProps {
	count?: number;
	page?: number;
	rows?: ScamAlert[];
	rowsPerPage?: number;
}

export function ScamAlertsTable({ count, rows, page = 0, rowsPerPage = 10 }: ScamAlertsTableProps): React.JSX.Element {
	const { alerts, loading, error, refetch } = useScamAlerts();
	const { user: currentUser } = useUser();

	// Use real data if no props provided, otherwise use props (for flexibility)
	const actualRows = rows || alerts;
	const actualCount = count || alerts.length;

	// CRUD Dialog States
	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [selectedAlert, setSelectedAlert] = React.useState<ScamAlert | null>(null);
	const [formData, setFormData] = React.useState({
		title: "",
		description: "",
		severity: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
		targetAudience: "ALL" as "ALL" | "SPECIFIC_GROUPS",
		expiresAt: "",
	});

	// Admin approval states
	const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false);
	const [approvalAction, setApprovalAction] = React.useState<"approve" | "reject">("approve");
	const [adminNotes, setAdminNotes] = React.useState("");

	// CRUD Functions
	const handleCreate = async () => {
		try {
			const response = await apiClient.createScamAlert({
				title: formData.title,
				description: formData.description,
				severity: formData.severity,
				targetAudience: formData.targetAudience,
				expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
			});

			if (response.success) {
				toast.success("Scam alert created successfully!");
				setCreateDialogOpen(false);
				resetForm();
				refetch();
			} else {
				toast.error(response.error || "Failed to create scam alert");
			}
		} catch (error) {
			console.error("Error creating scam alert:", error);
			toast.error("Failed to create scam alert");
		}
	};

	const handleEdit = async () => {
		if (!selectedAlert) return;

		try {
			const response = await apiClient.updateScamAlert(selectedAlert.id, {
				title: formData.title,
				description: formData.description,
				severity: formData.severity,
				targetAudience: formData.targetAudience,
				expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
			});

			if (response.success) {
				toast.success("Scam alert updated successfully!");
				setEditDialogOpen(false);
				resetForm();
				refetch();
			} else {
				toast.error(response.error || "Failed to update scam alert");
			}
		} catch (error) {
			console.error("Error updating scam alert:", error);
			toast.error("Failed to update scam alert");
		}
	};

	const handleDelete = async () => {
		if (!selectedAlert) return;

		try {
			const response = await apiClient.deleteScamAlert(selectedAlert.id);

			if (response.success) {
				toast.success("Scam alert deleted successfully!");
				setDeleteDialogOpen(false);
				refetch();
			} else {
				toast.error(response.error || "Failed to delete scam alert");
			}
		} catch (error) {
			console.error("Error deleting scam alert:", error);
			toast.error("Failed to delete scam alert");
		}
	};

	const handleApproval = async () => {
		if (!selectedAlert) return;

		try {
			let response;
			if (approvalAction === "approve") {
				response = await apiClient.approveScamAlert(selectedAlert.id, adminNotes);
			} else {
				response = await apiClient.rejectScamAlert(selectedAlert.id, adminNotes);
			}

			if (response.success) {
				toast.success(`Scam alert ${approvalAction}d successfully!`);
				setApprovalDialogOpen(false);
				refetch();
			} else {
				toast.error(response.error || `Failed to ${approvalAction} scam alert`);
			}
		} catch (error) {
			console.error(`Error ${approvalAction}ing scam alert:`, error);
			toast.error(`Failed to ${approvalAction} scam alert`);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			severity: "MEDIUM",
			targetAudience: "ALL",
			expiresAt: "",
		});
		setSelectedAlert(null);
		setAdminNotes("");
	};

	const openEditDialog = (alert: ScamAlert) => {
		setSelectedAlert(alert);
		setFormData({
			title: alert.title,
			description: alert.description,
			severity: alert.severity,
			targetAudience: alert.targetAudience,
			expiresAt: alert.expiresAt ? alert.expiresAt.toISOString().split("T")[0] : "",
		});
		setEditDialogOpen(true);
	};

	const openApprovalDialog = (alert: ScamAlert, action: "approve" | "reject") => {
		setSelectedAlert(alert);
		setApprovalAction(action);
		setAdminNotes("");
		setApprovalDialogOpen(true);
	};

	const rowIds = React.useMemo(() => {
		return actualRows.map((alert) => alert.id);
	}, [actualRows]);

	const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

	const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < actualRows.length;
	const selectedAll = actualRows.length > 0 && selected?.size === actualRows.length;

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography>Loading scam alerts...</Typography>
				</Box>
			</Card>
		);
	}

	// Show error state
	if (error) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography color="error">Error: {error}</Typography>
				</Box>
			</Card>
		);
	}

	return (
		<>
			{/* Create Button for Legal Officers */}
			{currentUser?.roles === 2 && (
				<Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
					<Button variant="contained" startIcon={<PlusIcon />} onClick={() => setCreateDialogOpen(true)}>
						Create Scam Alert
					</Button>
				</Box>
			)}

			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "800px" }}>
						<TableHead>
							<TableRow>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedAll}
										indeterminate={selectedSome}
										onChange={(event) => {
											if (event.target.checked) {
												selectAll();
											} else {
												deselectAll();
											}
										}}
									/>
								</TableCell>
								<TableCell>Alert</TableCell>
								<TableCell>Severity</TableCell>
								<TableCell>Created By</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Created</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{actualRows.map((row) => {
								const isSelected = selected?.has(row.id);

								return (
									<TableRow hover key={row.id} selected={isSelected}>
										<TableCell padding="checkbox">
											<Checkbox
												checked={isSelected}
												onChange={(event) => {
													if (event.target.checked) {
														selectOne(row.id);
													} else {
														deselectOne(row.id);
													}
												}}
											/>
										</TableCell>
										<TableCell>
											<Stack sx={{ alignItems: "flex-start" }} direction="column" spacing={1}>
												<Typography variant="subtitle2">{row.title}</Typography>
												<Typography color="text.secondary" variant="body2">
													{row.description.length > 100 ? `${row.description.substring(0, 100)}...` : row.description}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>
											<Chip
												color={row.severity === "HIGH" ? "error" : row.severity === "MEDIUM" ? "warning" : "success"}
												label={row.severity}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
												<Avatar src={row.createdByUser.profilepic} />
												<Stack sx={{ alignItems: "flex-start" }} direction="column" spacing={0}>
													<Typography variant="subtitle2">
														{row.createdByUser.name || row.createdByUser.username}
													</Typography>
													<Typography color="text.secondary" variant="body2">
														{row.createdByUser.email}
													</Typography>
												</Stack>
											</Stack>
										</TableCell>
										<TableCell>
											<Chip
												color={row.status === "approved" ? "success" : row.status === "rejected" ? "error" : "warning"}
												label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.createdAt.toLocaleDateString()}</Typography>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={1}>
												<IconButton title="View Details">
													<EyeIcon />
												</IconButton>

												{/* Edit button for Legal Officers (own alerts only) */}
												{currentUser?.roles === 2 && row.createdBy === currentUser.userid ? (
													<IconButton title="Edit Alert" onClick={() => openEditDialog(row)}>
														<EditIcon />
													</IconButton>
												) : null}

												{/* Delete button for Legal Officers (own alerts only) */}
												{currentUser?.roles === 2 && row.createdBy === currentUser.userid ? (
													<IconButton
														title="Delete Alert"
														onClick={() => {
															setSelectedAlert(row);
															setDeleteDialogOpen(true);
														}}
														color="error"
													>
														<TrashIcon />
													</IconButton>
												) : null}

												{/* Admin approval buttons */}
												{currentUser?.roles === 1 && row.status === "pending" && (
													<>
														<IconButton
															title="Approve Alert"
															onClick={() => openApprovalDialog(row, "approve")}
															color="success"
														>
															<CheckIcon />
														</IconButton>
														<IconButton
															title="Reject Alert"
															onClick={() => openApprovalDialog(row, "reject")}
															color="error"
														>
															<XIcon />
														</IconButton>
													</>
												)}
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Box>
				<Divider />
				<TablePagination
					component="div"
					count={actualCount}
					onPageChange={noop}
					onRowsPerPageChange={noop}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
				/>
			</Card>

			{/* Create Scam Alert Dialog */}
			<Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Create New Scam Alert</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Title"
							fullWidth
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description"
							multiline
							rows={4}
							fullWidth
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required
						/>
						<Stack direction="row" spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Severity</InputLabel>
								<Select
									value={formData.severity}
									label="Severity"
									onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
								>
									<MenuItem value="HIGH">High</MenuItem>
									<MenuItem value="MEDIUM">Medium</MenuItem>
									<MenuItem value="LOW">Low</MenuItem>
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Target Audience</InputLabel>
								<Select
									value={formData.targetAudience}
									label="Target Audience"
									onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
								>
									<MenuItem value="ALL">All Users</MenuItem>
									<MenuItem value="SPECIFIC_GROUPS">Specific Groups</MenuItem>
								</Select>
							</FormControl>
						</Stack>
						<TextField
							label="Expiration Date (Optional)"
							type="date"
							fullWidth
							value={formData.expiresAt}
							onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
							InputLabelProps={{ shrink: true }}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleCreate}
						variant="contained"
						disabled={!formData.title.trim() || !formData.description.trim()}
					>
						Create Alert
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Scam Alert Dialog */}
			<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Edit Scam Alert</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Title"
							fullWidth
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description"
							multiline
							rows={4}
							fullWidth
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required
						/>
						<Stack direction="row" spacing={2}>
							<FormControl fullWidth>
								<InputLabel>Severity</InputLabel>
								<Select
									value={formData.severity}
									label="Severity"
									onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
								>
									<MenuItem value="HIGH">High</MenuItem>
									<MenuItem value="MEDIUM">Medium</MenuItem>
									<MenuItem value="LOW">Low</MenuItem>
								</Select>
							</FormControl>
							<FormControl fullWidth>
								<InputLabel>Target Audience</InputLabel>
								<Select
									value={formData.targetAudience}
									label="Target Audience"
									onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
								>
									<MenuItem value="ALL">All Users</MenuItem>
									<MenuItem value="SPECIFIC_GROUPS">Specific Groups</MenuItem>
								</Select>
							</FormControl>
						</Stack>
						<TextField
							label="Expiration Date (Optional)"
							type="date"
							fullWidth
							value={formData.expiresAt}
							onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
							InputLabelProps={{ shrink: true }}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleEdit}
						variant="contained"
						disabled={!formData.title.trim() || !formData.description.trim()}
					>
						Update Alert
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Scam Alert</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete "{selectedAlert?.title}"? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Admin Approval Dialog */}
			<Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Scam Alert</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<Typography variant="body2">
							<strong>Alert:</strong> {selectedAlert?.title}
						</Typography>
						<Typography variant="body2">
							<strong>Created By:</strong> {selectedAlert?.createdByUser.username}
						</Typography>
						<TextField
							label="Admin Notes"
							multiline
							rows={3}
							fullWidth
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder={
								approvalAction === "approve" ? "Optional notes for approval" : "Required notes for rejection"
							}
							required={approvalAction === "reject"}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleApproval}
						variant="contained"
						color={approvalAction === "approve" ? "success" : "error"}
						disabled={approvalAction === "reject" && !adminNotes.trim()}
					>
						{approvalAction === "approve" ? "Approve" : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
