"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";

import { apiClient } from "@/lib/api-client";
import { useSelection } from "@/hooks/use-selection";

import { StatusManagementDialog } from "./status-management-dialog";

function noop(): void {
	// do nothing
}

export interface ScamReport {
	id: string;
	title: string;
	description: string;
	scammerInfo: string;
	platform: string;
	status: "pending" | "investigating" | "resolved" | "dismissed";
	reportedBy: {
		name: string;
		email: string;
		avatar?: string;
	};
	createdAt: Date;
}

// Hook to fetch scam reports from backend
function useScamReports() {
	const [reports, setReports] = React.useState<ScamReport[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		async function fetchReports() {
			try {
				setLoading(true);
				const response = await apiClient.getScamReports();

				if (response.success && response.data) {
					// Transform backend data to frontend format
					const transformedReports: ScamReport[] = response.data.map((report: any) => ({
						id: report.id?.toString(),
						title: report.title || "Untitled Report",
						description: report.description || "",
						scammerInfo: report.scammerInfo || "",
						platform: report.platform || "Unknown",
						status: report.status || "pending",
						reportedBy: {
							name: report.user?.name || "Anonymous",
							email: report.user?.email || "",
							avatar: report.user?.avatar || "/assets/avatar.png",
						},
						createdAt: new Date(report.createdAt || Date.now()),
					}));

					setReports(transformedReports);
				} else {
					setError(response.error || "Failed to fetch reports");
				}
			} catch (err) {
				console.error("Error fetching scam reports:", err);
				setError("Failed to fetch reports");
			} finally {
				setLoading(false);
			}
		}

		fetchReports();
	}, []);

	return { reports, loading, error, refetch: () => fetchReports() };
}

interface ScamReportsTableProps {
	count?: number;
	page?: number;
	rows?: ScamReport[];
	rowsPerPage?: number;
	onEditReport?: (report: ScamReport) => void;
	onRefresh?: () => void; // Callback to refresh parent
}

// Mock data for demonstration
const mockReports: ScamReport[] = [
	{
		id: "1",
		title: "Fake Investment Scheme on Facebook",
		description:
			"Someone is promoting a fake cryptocurrency investment scheme promising 300% returns in 30 days. They are using fake testimonials and celebrity endorsements.",
		scammerInfo: "Profile: John Smith, Phone: +1234567890",
		platform: "Facebook",
		status: "investigating",
		reportedBy: {
			name: "Alice Johnson",
			email: "alice.johnson@email.com",
			avatar: "/assets/avatar-1.png",
		},
		createdAt: new Date("2024-01-15"),
	},
	{
		id: "2",
		title: "WhatsApp Romance Scam",
		description:
			"Scammer pretending to be a US soldier asking for money for emergency medical treatment. Using stolen photos and emotional manipulation.",
		scammerInfo: 'WhatsApp: +234567890123, Claims to be "Captain Mike Johnson"',
		platform: "WhatsApp",
		status: "pending",
		reportedBy: {
			name: "Sarah Wilson",
			email: "sarah.wilson@email.com",
			avatar: "/assets/avatar-2.png",
		},
		createdAt: new Date("2024-01-14"),
	},
	{
		id: "3",
		title: "Phishing Email Campaign",
		description:
			"Mass phishing emails claiming to be from bank asking users to verify account details. Very convincing fake website.",
		scammerInfo: "Email: security@fake-bank.com, Website: fake-bank-security.com",
		platform: "Email",
		status: "resolved",
		reportedBy: {
			name: "David Chen",
			email: "david.chen@email.com",
			avatar: "/assets/avatar-3.png",
		},
		createdAt: new Date("2024-01-12"),
	},
	{
		id: "4",
		title: "Fake Online Store",
		description:
			"Website selling electronics at extremely low prices but never delivering products. Taking payments via untraceable methods.",
		scammerInfo: "Website: cheap-electronics-store.com, Email: support@cheap-electronics.com",
		platform: "Website",
		status: "dismissed",
		reportedBy: {
			name: "Emma Davis",
			email: "emma.davis@email.com",
			avatar: "/assets/avatar-4.png",
		},
		createdAt: new Date("2024-01-10"),
	},
];

export function ScamReportsTable({
	count,
	rows,
	page = 0,
	rowsPerPage = 10,
	onEditReport,
	onRefresh,
}: ScamReportsTableProps): React.JSX.Element {
	const router = useRouter();
	const { reports, loading, error, refetch } = useScamReports();

	// Status management dialog state
	const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
	const [selectedReport, setSelectedReport] = React.useState<ScamReport | null>(null);

	// Delete confirmation dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [reportToDelete, setReportToDelete] = React.useState<ScamReport | null>(null);

	const handleDeleteClick = (report: ScamReport) => {
		setReportToDelete(report);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (reportToDelete) {
			try {
				const response = await apiClient.delete(`/scam-reports/${reportToDelete.id}`);
				if (response.success) {
					refetch();
					onRefresh?.(); // Notify parent to refresh
				} else {
					alert("Failed to delete report: " + (response.error || "Unknown error"));
				}
			} catch (err) {
				console.error("Error deleting report:", err);
				alert("Failed to delete report");
			}
		}
		setDeleteDialogOpen(false);
		setReportToDelete(null);
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setReportToDelete(null);
	};

	// Use real data if no props provided, otherwise use props (for flexibility)
	const actualRows = rows || reports;
	const actualCount = count || reports.length;
	const rowIds = React.useMemo(() => {
		return actualRows.map((report) => report.id);
	}, [actualRows]);

	const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

	const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < actualRows.length;
	const selectedAll = actualRows.length > 0 && selected?.size === actualRows.length;

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography>Loading scam reports...</Typography>
				</Box>
			</Card>
		);
	}

	// Show error state
	if (error) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography color="error">Error: {error}</Typography>
				</Box>
			</Card>
		);
	}

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
								<TableCell>Report</TableCell>
								<TableCell>Reported By</TableCell>
								<TableCell>Platform</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Date</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{actualRows.map((row) => {
								const isSelected = selected?.has(row.id);

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
													{row.description.length > 100 ? `${row.description.substring(0, 100)}...` : row.description}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>
											<Stack sx={{ alignItems: "flex-start" }} direction="column" spacing={0}>
												<Typography variant="subtitle2">{row.reportedBy.name}</Typography>
												<Typography color="text.secondary" variant="body2">
													{row.reportedBy.email}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.platform}</Typography>
										</TableCell>
										<TableCell>
											<Chip
												color={
													row.status === "resolved"
														? "success"
														: row.status === "investigating"
															? "warning"
															: row.status === "dismissed"
																? "error"
																: "default"
												}
												label={row.status}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.createdAt.toLocaleDateString()}</Typography>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={1}>
												<IconButton
													size="small"
													title="View Report Details"
													onClick={() => {
														router.push(`/dashboard/scam-reports/${row.id}`);
													}}
												>
													<EyeIcon />
												</IconButton>
												{onEditReport && (
													<IconButton size="small" title="Edit Report" onClick={() => onEditReport(row)}>
														<EditIcon />
													</IconButton>
												)}
												{onEditReport && (
													<IconButton
														size="small"
														title="Delete Report"
														onClick={() => handleDeleteClick(row)}
														sx={{ color: "error.main" }}
													>
														<TrashIcon />
													</IconButton>
												)}
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}
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

			{/* Status Management Dialog */}
			{selectedReport && (
				<StatusManagementDialog
					open={statusDialogOpen}
					onClose={() => {
						setStatusDialogOpen(false);
						setSelectedReport(null);
					}}
					reportId={selectedReport.id}
					currentStatus={selectedReport.status}
					reportTitle={selectedReport.title}
					onStatusUpdated={() => {
						refetch();
					}}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">Delete Scam Report</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Cancel
					</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
