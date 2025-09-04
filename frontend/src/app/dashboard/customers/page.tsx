import * as React from "react";
import type { Metadata } from "next";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { config } from "@/config";
import { UsersFilters } from "@/components/dashboard/users/users-filters";
import { UsersTable } from "@/components/dashboard/users/users-table";

export const metadata = { title: `User Management | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">User Management</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Typography color="text.secondary" variant="body1">
							Manage user accounts and role change requests
						</Typography>
					</Stack>
				</Stack>
			</Stack>
			<UsersFilters />
			<UsersTable />
		</Stack>
	);
}
