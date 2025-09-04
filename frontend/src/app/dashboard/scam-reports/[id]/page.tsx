"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Divider,
	Grid,
	Stack,
	Typography,
	IconButton,
} from "@mui/material";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";

import { apiClient } from "@/lib/api-client";

interface ScamReportDetails {
	id: string;
	title: string;
	description: string;
	scammerInfo: string;
	platform: string;
	status: "pending" | "investigating" | "resolved" | "dismissed";
	reportedBy: {
		name: string;
		email: string;
	};
	createdAt: Date;
	updatedAt: Date;
	evidenceFiles?: string[];
}

export default function ScamReportDetailsPage(): React.JSX.Element {
	const params = useParams();
	const router = useRouter();
	const reportId = params.id as string;

	const [report, setReport] = React.useState<ScamReportDetails | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		async function fetchReport() {
			try {
				setLoading(true);
				const response = await apiClient.getScamReport(reportId);

				if (response.success && response.data) {
					const reportData = response.data;
					setReport({
						id: reportData.reportid?.toString() || reportData.id,
						title: reportData.title || "Untitled Report",
						description: reportData.description || "",
						scammerInfo: reportData.scammerinfo || reportData.scammer_info || "",
						platform: reportData.platform || "Unknown",
						status: reportData.status || "pending",
						reportedBy: {
							name: reportData.reportedby_name || reportData.user?.name || "Anonymous",
							email: reportData.reportedby_email || reportData.user?.email || "",
						},
						createdAt: new Date(reportData.createdat || reportData.created_at || Date.now()),
						updatedAt: new Date(reportData.updatedat || reportData.updated_at || Date.now()),
						evidenceFiles: reportData.evidencefiles || reportData.evidence_files || [],
					});
				} else {
					setError(response.error || "Failed to fetch report");
				}
			} catch (err) {
				console.error("Error fetching report:", err);
				setError("Failed to fetch report");
			} finally {
				setLoading(false);
			}
		}

		if (reportId) {
			fetchReport();
		}
	}, [reportId]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "resolved":
				return "success";
			case "investigating":
				return "warning";
			case "dismissed":
				return "error";
			default:
				return "default";
		}
	};

	if (loading) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Typography>Loading report details...</Typography>
			</Box>
		);
	}

	if (error || !report) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Typography color="error">Error: {error || "Report not found"}</Typography>
				<Button
					startIcon={<ArrowLeftIcon />}
					onClick={() => router.push("/dashboard/scam-reports")}
					sx={{ mt: 2 }}
				>
					Back to Reports
				</Button>
			</Box>
		);
	}

	return (
		<Stack spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
				<IconButton onClick={() => router.push("/dashboard/scam-reports")}>
					<ArrowLeftIcon />
				</IconButton>
				<Stack sx={{ flex: 1 }}>
					<Typography variant="h4">Scam Report Details</Typography>
					<Typography color="text.secondary" variant="body1">
						Review and manage this scam report
					</Typography>
				</Stack>
				<Button
					startIcon={<EditIcon />}
					variant="contained"
					onClick={() => {
						// TODO: Open status management dialog
						console.log("Manage report status:", report.id);
					}}
				>
					Manage Status
				</Button>
			</Stack>

			<Grid container spacing={3}>
				{/* Main Content */}
				<Grid item xs={12} md={8}>
					<Card>
						<CardHeader
							title={report.title}
							action={
								<Chip
									color={getStatusColor(report.status) as any}
									label={report.status.toUpperCase()}
									size="small"
								/>
							}
						/>
						<Divider />
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" gutterBottom>
										Description
									</Typography>
									<Typography variant="body1" color="text.secondary">
										{report.description}
									</Typography>
								</Box>

								<Box>
									<Typography variant="h6" gutterBottom>
										Scammer Information
									</Typography>
									<Typography variant="body1" color="text.secondary">
										{report.scammerInfo}
									</Typography>
								</Box>

								{report.evidenceFiles && report.evidenceFiles.length > 0 && (
									<Box>
										<Typography variant="h6" gutterBottom>
											Evidence Files
										</Typography>
										<Stack spacing={1}>
											{report.evidenceFiles.map((file, index) => (
												<Typography key={index} variant="body2" color="primary">
													{file}
												</Typography>
											))}
										</Stack>
									</Box>
								)}
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Sidebar */}
				<Grid item xs={12} md={4}>
					<Stack spacing={3}>
						{/* Report Info */}
						<Card>
							<CardHeader title="Report Information" />
							<Divider />
							<CardContent>
								<Stack spacing={2}>
									<Box>
										<Typography variant="subtitle2" color="text.secondary">
											Platform
										</Typography>
										<Typography variant="body1">{report.platform}</Typography>
									</Box>
									<Box>
										<Typography variant="subtitle2" color="text.secondary">
											Status
										</Typography>
										<Chip
											color={getStatusColor(report.status) as any}
											label={report.status.toUpperCase()}
											size="small"
										/>
									</Box>
									<Box>
										<Typography variant="subtitle2" color="text.secondary">
											Created
										</Typography>
										<Typography variant="body2">{report.createdAt.toLocaleString()}</Typography>
									</Box>
									<Box>
										<Typography variant="subtitle2" color="text.secondary">
											Last Updated
										</Typography>
										<Typography variant="body2">{report.updatedAt.toLocaleString()}</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>

						{/* Reporter Info */}
						<Card>
							<CardHeader title="Reported By" />
							<Divider />
							<CardContent>
								<Stack spacing={1}>
									<Typography variant="subtitle1">{report.reportedBy.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										{report.reportedBy.email}
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					</Stack>
				</Grid>
			</Grid>
		</Stack>
	);
}
