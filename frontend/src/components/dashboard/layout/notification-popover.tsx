"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";

import { useNotifications } from "@/hooks/use-notifications";

interface NotificationPopoverProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	open: boolean;
}

interface Notification {
	id: number;
	title: string;
	description: string;
	type: number;
	priority: string;
	createdAt: string;
	createdByUser: {
		username: string;
		name: string;
	};
}

export function NotificationPopover({ anchorEl, onClose, open }: NotificationPopoverProps): React.JSX.Element {
	const { notifications, loading, error, deleteNotification, refetch } = useNotifications();
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [notificationToDelete, setNotificationToDelete] = React.useState<Notification | null>(null);

	const handleDeleteClick = (notification: Notification) => {
		setNotificationToDelete(notification);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (notificationToDelete) {
			try {
				await deleteNotification(notificationToDelete.id);
				// Refresh notifications after deletion
				refetch();
			} catch (error) {
				console.error("Failed to delete notification:", error);
			}
		}
		setDeleteDialogOpen(false);
		setNotificationToDelete(null);
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setNotificationToDelete(null);
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

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "error.main";
			case "medium":
				return "warning.main";
			case "low":
				return "info.main";
			default:
				return "text.secondary";
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	return (
		<Popover
			anchorEl={anchorEl}
			anchorOrigin={{
				horizontal: "right",
				vertical: "bottom",
			}}
			onClose={onClose}
			open={open}
			PaperProps={{
				sx: {
					width: 400,
					maxHeight: 500,
				},
			}}
		>
			<Box sx={{ p: 2 }}>
				<Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
					<BellIcon />
					<Typography variant="h6">Notifications</Typography>
				</Stack>
				<Divider />
			</Box>

			{loading ? (
				<Box sx={{ p: 2, textAlign: "center" }}>
					<Typography>Loading notifications...</Typography>
				</Box>
			) : error ? (
				<Box sx={{ p: 2, textAlign: "center" }}>
					<Typography color="error">Failed to load notifications</Typography>
				</Box>
			) : notifications.length === 0 ? (
				<Box sx={{ p: 2, textAlign: "center" }}>
					<Typography color="text.secondary">No notifications</Typography>
				</Box>
			) : (
				<List sx={{ p: 0 }}>
					{notifications.map((notification: Notification) => (
						<ListItem
							key={notification.id}
							sx={{
								borderBottom: "1px solid var(--mui-palette-divider)",
								"&:last-child": {
									borderBottom: "none",
								},
							}}
						>
							<ListItemAvatar>
								<Avatar sx={{ bgcolor: getPriorityColor(notification.priority) }}>
									{notification.title.charAt(0).toUpperCase()}
								</Avatar>
							</ListItemAvatar>
							<ListItemText
								component="div"
								primary={
									<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
										<Typography variant="subtitle2" component="span">
											{notification.title}
										</Typography>
										<Typography
											variant="caption"
											sx={{
												bgcolor: getPriorityColor(notification.priority),
												color: "white",
												px: 1,
												py: 0.25,
												borderRadius: 1,
												fontSize: "0.7rem",
											}}
										>
											{notification.priority}
										</Typography>
									</Stack>
								}
								secondary={
									<Box>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
											{notification.description}
										</Typography>
										<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
											<Typography variant="caption" color="text.secondary">
												{getTypeLabel(notification.type)} • {formatDate(notification.createdAt)}
											</Typography>
										</Stack>
									</Box>
								}
							/>
							<IconButton size="small" onClick={() => handleDeleteClick(notification)} sx={{ color: "error.main" }}>
								<TrashIcon />
							</IconButton>
						</ListItem>
					))}
				</List>
			)}

			{notifications.length > 0 && (
				<Box sx={{ p: 2, borderTop: "1px solid var(--mui-palette-divider)" }}>
					<Button
						fullWidth
						onClick={() => {
							onClose();
							// You can add navigation to full notifications page here
						}}
						variant="outlined"
					>
						View All Notifications
					</Button>
				</Box>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">Delete Notification</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						Are you sure you want to remove "{notificationToDelete?.title}" from your notifications? This will only hide
						it from your view and won't delete it from the system.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Cancel
					</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained">
						Remove
					</Button>
				</DialogActions>
			</Dialog>
		</Popover>
	);
}
