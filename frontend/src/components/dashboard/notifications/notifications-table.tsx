"use client";

import * as React from "react";
import {
	Box,
	Card,
	Checkbox,
	Chip,
	Divider,
	IconButton,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { toast } from "react-hot-toast";

import { useSelection } from "@/hooks/use-selection";

import { NotificationFormDialog } from "./notification-form-dialog";

function noop(): void {
	// do nothing
}

export interface Notification {
	id: number;
	title: string;
	description: string;
	roles: number; // 1=User, 2=Legal Officer Only, 3=All Users
	type: number; // 1=Notification, 2=Announcement, 3=Alert
	priority: "low" | "medium" | "high" | "urgent";
	status: "active" | "inactive" | "expired";
	createdAt: Date;
	updatedAt: Date;
	expiresAt?: Date;
	createdBy: number;
	createdByUser?: {
		userid: number;
		username: string;
		name: string;
	};
}

// Mock data for demonstration
const mockNotifications: Notification[] = [
	{
		id: 1,
		title: "System Maintenance Scheduled",
		description:
			"We will be performing scheduled maintenance on Sunday, 2AM-4AM EST. Some services may be temporarily unavailable.",
		roles: 3, // All Users
		type: 2, // Announcement
		status: "active",
		priority: "high",
		createdAt: new Date("2024-01-20"),
		updatedAt: new Date("2024-01-20"),
		expiresAt: new Date("2024-01-28"),
		createdBy: 1,
		createdByUser: {
			userid: 1,
			username: "admin",
			name: "System Administrator",
		},
	},
	{
		id: 2,
		title: "New Scam Alert Feature",
		description:
			"We've added a new feature to help you stay informed about the latest scam trends. Check it out in the Scam Alerts section!",
		roles: 3, // All Users
		type: 1, // Notification
		status: "active",
		priority: "medium",
		createdAt: new Date("2024-01-18"),
		updatedAt: new Date("2024-01-18"),
		createdBy: 1,
		createdByUser: {
			userid: 1,
			username: "admin",
			name: "System Administrator",
		},
	},
	{
		id: 3,
		title: "Security Update Required",
		description:
			"Please update your password to meet our new security requirements. Passwords must be at least 12 characters long.",
		roles: 3, // All Users
		type: 3, // Alert
		status: "inactive",
		priority: "high",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-16"),
		expiresAt: new Date("2024-01-25"),
		createdBy: 1,
		createdByUser: {
			userid: 1,
			username: "admin",
			name: "System Administrator",
		},
	},
];

interface NotificationsTableProps {
	count?: number;
	page?: number;
	rows?: Notification[];
	rowsPerPage?: number;
}

export const NotificationsTable = React.forwardRef<{ openCreateDialog: () => void }, NotificationsTableProps>(
	function NotificationsTable({ count, rows, page = 0, rowsPerPage = 10 }, ref) {
		const [notifications, setNotifications] = React.useState<Notification[]>([]);
		const [loading, setLoading] = React.useState(true);
		const [formDialogOpen, setFormDialogOpen] = React.useState(false);
		const [editingNotification, setEditingNotification] = React.useState<Notification | null>(null);

		// Fetch notifications from API
		const fetchNotifications = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("auth-token");
				if (!token) {
					console.error("No authentication token found");
					setNotifications(mockNotifications);
					return;
				}

				const response = await fetch("http://localhost:5000/api/notifications", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						setNotifications(data.data);
					} else {
						console.error("Failed to fetch notifications:", data.error);
						// Fallback to mock data if API fails
						setNotifications(mockNotifications);
					}
				} else {
					console.error("Failed to fetch notifications");
					// Fallback to mock data if API fails
					setNotifications(mockNotifications);
				}
			} catch (error) {
				console.error("Error fetching notifications:", error);
				// Fallback to mock data if API fails
				setNotifications(mockNotifications);
			} finally {
				setLoading(false);
			}
		};

		// Load notifications on component mount
		React.useEffect(() => {
			fetchNotifications();
		}, []);

		// Expose methods to parent component
		React.useImperativeHandle(ref, () => ({
			openCreateDialog: () => {
				setEditingNotification(null);
				setFormDialogOpen(true);
			},
		}));

		// Use real data if no props provided, otherwise use props (for flexibility)
		const actualRows = rows || notifications;
		const actualCount = count || notifications.length;
		const rowIds = React.useMemo(() => {
			return actualRows.map((notification) => notification.id);
		}, [actualRows]);

		const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

		const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < actualRows.length;
		const selectedAll = actualRows.length > 0 && selected?.size === actualRows.length;

		const handleToggleActive = async (id: string, isActive: boolean) => {
			try {
				// TODO: API call to update notification status
				setNotifications((prev) =>
					prev.map((notification) =>
						notification.id === id ? { ...notification, isActive, updatedAt: new Date() } : notification
					)
				);
				toast.success(`Notification ${isActive ? "activated" : "deactivated"} successfully!`);
			} catch (error) {
				toast.error("Failed to update notification status");
			}
		};

		const handleView = (notification: Notification) => {
			console.log("View notification:", notification);
			// You can implement a view dialog here
		};

		const handleEdit = (notification: Notification) => {
			setEditingNotification(notification);
			setFormDialogOpen(true);
		};

		const handleDelete = async (id: string) => {
			if (confirm("Are you sure you want to delete this notification?")) {
				try {
					const token = localStorage.getItem("auth-token");
					if (!token) {
						toast.error("Authentication token not found");
						return;
					}

					const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.ok) {
						setNotifications((prev) => prev.filter((n) => n.id.toString() !== id));
						toast.success("Notification deleted successfully!");
					} else {
						toast.error("Failed to delete notification");
					}
				} catch (error) {
					console.error("Error deleting notification:", error);
					toast.error("Failed to delete notification");
				}
			}
		};

		const handleSubmit = async (data: Partial<Notification>) => {
			try {
				const token = localStorage.getItem("auth-token");
				if (!token) {
					toast.error("Authentication token not found");
					return;
				}

				if (editingNotification) {
					// Update existing notification
					const response = await fetch(`http://localhost:5000/api/notifications/${editingNotification.id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(data),
					});

					if (response.ok) {
						const result = await response.json();
						if (result.success) {
							// Refresh the notifications list
							await fetchNotifications();
							toast.success("Notification updated successfully!");
						} else {
							toast.error(result.error || "Failed to update notification");
						}
					} else {
						toast.error("Failed to update notification");
					}
				} else {
					// Create new notification
					const response = await fetch("http://localhost:5000/api/notifications", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(data),
					});

					if (response.ok) {
						const result = await response.json();
						if (result.success) {
							// Refresh the notifications list
							await fetchNotifications();
							toast.success("Notification created successfully!");
						} else {
							toast.error(result.error || "Failed to create notification");
						}
					} else {
						toast.error("Failed to create notification");
					}
				}
			} catch (error) {
				console.error("Error saving notification:", error);
				toast.error("Failed to save notification");
			} finally {
				setFormDialogOpen(false);
				setEditingNotification(null);
			}
		};

		const getTypeColor = (type: number) => {
			switch (type) {
				case 1:
					return "info"; // Notification
				case 2:
					return "success"; // Announcement
				case 3:
					return "warning"; // Alert
				default:
					return "default";
			}
		};

		const getTypeLabel = (type: number) => {
			switch (type) {
				case 1:
					return "Notification";
				case 2:
					return "Announcement";
				case 3:
					return "Alert";
				default:
					return "Unknown";
			}
		};

		const getRolesLabel = (roles: number) => {
			switch (roles) {
				case 1:
					return "User Only";
				case 2:
					return "Legal Officer";
				case 3:
					return "All Users";
				default:
					return "Unknown";
			}
		};

		const getPriorityColor = (priority: string) => {
			switch (priority) {
				case "urgent":
					return "error";
				case "high":
					return "error";
				case "medium":
					return "warning";
				case "low":
					return "default";
				default:
					return "default";
			}
		};

		const getStatusColor = (status: string) => {
			switch (status) {
				case "active":
					return "success";
				case "inactive":
					return "default";
				case "expired":
					return "error";
				default:
					return "default";
			}
		};

		return (
			<>
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
									<TableCell>Notification</TableCell>
									<TableCell>Type</TableCell>
									<TableCell>Priority</TableCell>
									<TableCell>Roles</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>Created</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={8} align="center">
											<Typography variant="body2" color="text.secondary">
												Loading notifications...
											</Typography>
										</TableCell>
									</TableRow>
								) : actualRows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} align="center">
											<Typography variant="body2" color="text.secondary">
												No notifications found.{" "}
												{notifications.length === 0 ? "The database is empty." : "Try adjusting your filters."}
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									actualRows.map((row) => {
										const isSelected = selected?.has(row.id);
										const isExpired = row.expiresAt && row.expiresAt < new Date();

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
															{row.description.length > 100
																? `${row.description.substring(0, 100)}...`
																: row.description}
														</Typography>
														{isExpired && <Chip label="EXPIRED" color="error" size="small" variant="outlined" />}
													</Stack>
												</TableCell>
												<TableCell>
													<Chip color={getTypeColor(row.type) as any} label={getTypeLabel(row.type)} size="small" />
												</TableCell>
												<TableCell>
													<Chip
														color={getPriorityColor(row.priority) as any}
														label={row.priority.toUpperCase()}
														size="small"
														variant="outlined"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="body2">{getRolesLabel(row.roles)}</Typography>
												</TableCell>
												<TableCell>
													<Chip
														color={getStatusColor(row.status) as any}
														label={row.status.toUpperCase()}
														size="small"
														variant="outlined"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="body2">{new Date(row.createdAt).toLocaleDateString()}</Typography>
												</TableCell>
												<TableCell>
													<Stack direction="row" spacing={1}>
														<IconButton size="small" title="View Notification" onClick={() => handleView(row)}>
															<EyeIcon />
														</IconButton>
														<IconButton size="small" title="Edit Notification" onClick={() => handleEdit(row)}>
															<EditIcon />
														</IconButton>
														<IconButton
															size="small"
															title="Delete Notification"
															onClick={() => handleDelete(row.id.toString())}
															color="error"
														>
															<DeleteIcon />
														</IconButton>
													</Stack>
												</TableCell>
											</TableRow>
										);
									})
								)}
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

				{/* Form Dialog */}
				<NotificationFormDialog
					open={formDialogOpen}
					onClose={() => {
						setFormDialogOpen(false);
						setEditingNotification(null);
					}}
					onSubmit={handleSubmit}
					notification={editingNotification}
				/>
			</>
		);
	}
);
