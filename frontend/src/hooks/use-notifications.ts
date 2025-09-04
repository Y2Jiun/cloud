import * as React from "react";

import { apiClient } from "@/lib/api-client";

interface Notification {
	id: number;
	title: string;
	description: string;
	type: number;
	priority: string;
	status: string;
	expiresAt: string | null;
	createdAt: string;
	createdByUser: {
		userid: number;
		username: string;
		name: string;
	};
}

interface NotificationsResponse {
	success: boolean;
	data: Notification[];
	message: string;
}

export function useNotifications() {
	const [notifications, setNotifications] = React.useState<Notification[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchNotifications = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			console.log("🔍 Fetching notifications...");
			console.log("🔑 Auth token:", localStorage.getItem("auth-token"));
			console.log("👤 Current user role:", localStorage.getItem("user-role"));

			const response = await apiClient.get("/notifications");
			console.log("📡 API Response:", response);

			if (response.success) {
				console.log("✅ Notifications fetched successfully:", response.data);
				setNotifications(response.data);
			} else {
				console.log("❌ API returned error:", response.error);
				setError(response.error || "Failed to fetch notifications");
			}
		} catch (err) {
			console.error("💥 Error fetching notifications:", err);
			setError("Failed to fetch notifications");
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteNotification = React.useCallback(async (id: number) => {
		try {
			const response = await apiClient.delete(`/notifications/user/${id}`);

			if (response.success) {
				// Remove the deleted notification from state
				setNotifications((prev) => prev.filter((notification) => notification.id !== id));
				return true;
			} else {
				throw new Error(response.error || "Failed to delete notification");
			}
		} catch (err) {
			console.error("Error deleting notification:", err);
			throw err;
		}
	}, []);

	React.useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	return {
		notifications,
		loading,
		error,
		deleteNotification,
		refetch: fetchNotifications,
	};
}
