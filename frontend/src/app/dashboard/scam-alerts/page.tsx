"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ScamAlertsFilters } from "@/components/dashboard/scam-alerts/scam-alerts-filters";
import { ScamAlertsTable } from "@/components/dashboard/scam-alerts/scam-alerts-table";

export default function Page(): React.JSX.Element {
	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Scam Alerts</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Typography color="text.secondary" variant="body1">
							Manage public scam alerts and warnings
						</Typography>
					</Stack>
				</Stack>
			</Stack>
			<ScamAlertsFilters />
			<ScamAlertsTable />
		</Stack>
	);
}
