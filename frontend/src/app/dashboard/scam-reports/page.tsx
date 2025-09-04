"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { useUser } from "@/hooks/use-user";
import { ScamReportFormDialog } from "@/components/dashboard/scam-reports/scam-report-form-dialog";
import { ScamReportsTable } from "@/components/dashboard/scam-reports/scam-reports-table";

export default function ScamReportsPage(): React.JSX.Element {
	const router = useRouter();
	const { user } = useUser();
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [editingReport, setEditingReport] = useState<any>(null);
	const [refreshKey, setRefreshKey] = useState(0); // Force table refresh

	// If admin lands on user route, redirect to admin-specific page
	useEffect(() => {
		if (user?.roles === 1) {
			router.replace("/dashboard/admin/scam-reports");
		}
	}, [user, router]);

	const handleCreateReport = () => {
		setEditingReport(null);
		setFormDialogOpen(true);
	};

	const handleEditReport = (report: any) => {
		setEditingReport(report);
		setFormDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setFormDialogOpen(false);
		setEditingReport(null);
	};

	const handleSuccess = () => {
		setRefreshKey((prev) => prev + 1); // Force table refresh
	};

	return (
		<Container maxWidth="xl">
			<Stack spacing={3}>
				<Stack direction="row" justifyContent="space-between" spacing={4}>
					<Box>
						<Typography variant="h4">My Scam Reports</Typography>
						<Typography variant="body1" color="text.secondary">
							Create, manage, and track your scam reports
						</Typography>
					</Box>
					<Button startIcon={<PlusIcon />} variant="contained" onClick={handleCreateReport}>
						Create Report
					</Button>
				</Stack>

				<Card>
					<CardContent>
						<ScamReportsTable key={refreshKey} onEditReport={handleEditReport} onRefresh={handleSuccess} />
					</CardContent>
				</Card>

				<ScamReportFormDialog
					open={formDialogOpen}
					onClose={handleCloseDialog}
					editingReport={editingReport}
					onSuccess={handleSuccess}
				/>
			</Stack>
		</Container>
	);
}
