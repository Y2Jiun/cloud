"use client";

import { useState } from "react";
import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";

export default function AdminScamAlertsPage(): React.JSX.Element {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleSuccess = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<Container maxWidth="xl">
			<Stack spacing={3}>
				<Stack direction="row" justifyContent="space-between" spacing={4}>
					<Box>
						<Typography variant="h4">Admin Scam Alerts</Typography>
						<Typography variant="body1" color="text.secondary">
							Manage and publish scam alerts to warn users
						</Typography>
					</Box>
				</Stack>

				<Card>
					<CardContent>
						<Typography variant="body1" color="text.secondary">
							Scam alerts management interface coming soon...
						</Typography>
					</CardContent>
				</Card>
			</Stack>
		</Container>
	);
}
