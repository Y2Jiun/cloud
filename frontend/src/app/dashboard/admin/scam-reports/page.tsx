"use client";

import { useState } from "react";
import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";

import { AdminScamReportsTable } from "@/components/dashboard/scam-reports/admin-scam-reports-table";

export default function AdminScamReportsPage(): React.JSX.Element {
	const [refreshKey, setRefreshKey] = useState(0); // Force table refresh

	const handleSuccess = () => {
		setRefreshKey((prev) => prev + 1); // Force table refresh
	};

	return (
		<Container maxWidth="xl">
			<Stack spacing={3}>
				<Stack direction="row" justifyContent="space-between" spacing={4}>
					<Box>
						<Typography variant="h4">Admin Scam Reports</Typography>
						<Typography variant="body1" color="text.secondary">
							Review and manage all scam reports submitted by users
						</Typography>
					</Box>
				</Stack>

				<Card>
					<CardContent>
						<AdminScamReportsTable key={refreshKey} onRefresh={handleSuccess} />
					</CardContent>
				</Card>
			</Stack>
		</Container>
	);
}

