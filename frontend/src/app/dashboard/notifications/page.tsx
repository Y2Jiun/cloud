"use client";

import * as React from "react";
import type { Metadata } from "next";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { config } from "@/config";
import { NotificationsFilters } from "@/components/dashboard/notifications/notifications-filters";
import { NotificationsTable } from "@/components/dashboard/notifications/notifications-table";

// export const metadata = { title: `Notifications | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
	const tableRef = React.useRef<{ openCreateDialog: () => void }>(null);

	const handleCreateNotification = () => {
		tableRef.current?.openCreateDialog();
	};

	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">System Notifications</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Typography color="text.secondary" variant="body1">
							Manage system-wide notifications and announcements for users
						</Typography>
					</Stack>
				</Stack>
				<div>
					<Button
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						onClick={handleCreateNotification}
					>
						Create Notification
					</Button>
				</div>
			</Stack>
			<NotificationsFilters />
			<NotificationsTable ref={tableRef} />
		</Stack>
	);
}
