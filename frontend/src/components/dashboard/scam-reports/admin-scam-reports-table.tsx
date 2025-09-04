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
import { CheckCircle as ApproveIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { XCircle as RejectIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useSelection } from "@/hooks/use-selection";

export interface ScamReport {
	id: string;
	title: string;
	description: string;
	scammerInfo: string;
	platform: string;
	status: "pending" | "investigating" | "resolved" | "dismissed" | "approved" | "rejected";
	reportedBy: {
		name: string;
		email: string;
		avatar?: string;
	};
	createdAt: Date;
}

// Hook to fetch all scam reports (admin view)
function useAdminScamReports() {
	const [reports, setReports] = React.useState<ScamReport[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchReports = React.useCallback(async () => {
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
	}, []);

	React.useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	return { reports, loading, error, refetch: fetchReports };
}

interface AdminScamReportsTableProps {
	count?: number;
	page?: number;
	rows?: ScamReport[];
	rowsPerPage?: number;
	onRefresh?: () => void;
}

export function AdminScamReportsTable({
	count,
	rows,
	page = 0,
	rowsPerPage = 10,
	onRefresh,
}: AdminScamReportsTableProps): React.JSX.Element {
	const router = useRouter();
	const { reports, loading, error, refetch } = useAdminScamReports();

	// Status management dialog state
	const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
	const [selectedReport, setSelectedReport] = React.useState<ScamReport | null>(null);
	const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
	const [rejectNotes, setRejectNotes] = React.useState("");
	const [processingReport, setProcessingReport] = React.useState<string | null>(null);

	// Approve report function
	const handleApproveReport = async (reportId: string) => {
		try {
			setProcessingReport(reportId);
			const response = await apiClient.put(`/scam-reports/${reportId}/approve`);

			if (response.success) {
				toast.success("Report approved successfully");
				refetch(); // Refresh the data
				onRefresh?.(); // Call parent refresh if provided
			} else {
				toast.error(response.error || "Failed to approve report");
			}
		} catch (error) {
			console.error("Error approving report:", error);
			toast.error("Failed to approve report");
		} finally {
			setProcessingReport(null);
		}
	};

	// Reject report function
	const handleRejectReport = async (reportId: string) => {
		if (!rejectNotes.trim()) {
			toast.error("Please provide rejection notes");
			return;
		}

		try {
			setProcessingReport(reportId);
			const response = await apiClient.put(`/scam-reports/${reportId}/reject`, {
				adminNotes: rejectNotes,
			});

			if (response.success) {
				toast.success("Report rejected successfully");
				setRejectDialogOpen(false);
				setRejectNotes("");
				refetch(); // Refresh the data
				onRefresh?.(); // Call parent refresh if provided
			} else {
				toast.error(response.error || "Failed to reject report");
			}
		} catch (error) {
			console.error("Error rejecting report:", error);
			toast.error("Failed to reject report");
		} finally {
			setProcessingReport(null);
		}
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "success";
			case "rejected":
				return "error";
			case "investigating":
				return "warning";
			case "resolved":
				return "info";
			case "dismissed":
				return "default";
			default:
				return "default";
		}
	};

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
											<Chip color={getStatusColor(row.status) as any} label={row.status} size="small" />
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
												{row.status === "pending" && (
													<>
														<IconButton
															size="small"
															title="Approve Report"
															onClick={() => handleApproveReport(row.id)}
															disabled={processingReport === row.id}
															sx={{ color: "success.main" }}
														>
															<ApproveIcon />
														</IconButton>
														<IconButton
															size="small"
															title="Reject Report"
															onClick={() => {
																setSelectedReport(row);
																setRejectDialogOpen(true);
															}}
															disabled={processingReport === row.id}
															sx={{ color: "error.main" }}
														>
															<RejectIcon />
														</IconButton>
													</>
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
					onPageChange={() => {}}
					onRowsPerPageChange={() => {}}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
				/>
			</Card>

			{/* Reject Report Dialog */}
			<Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Reject Report</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Please provide a reason for rejecting this report. This will be visible to the user who submitted the
						report.
					</DialogContentText>
					<Box sx={{ mt: 2 }}>
						<Typography variant="subtitle2" gutterBottom>
							Report: {selectedReport?.title}
						</Typography>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Submitted by: {selectedReport?.reportedBy.name}
						</Typography>
					</Box>
					<Box sx={{ mt: 3 }}>
						<Typography variant="subtitle2" gutterBottom>
							Rejection Notes *
						</Typography>
						<textarea
							value={rejectNotes}
							onChange={(e) => setRejectNotes(e.target.value)}
							placeholder="Enter the reason for rejecting this report..."
							style={{
								width: "100%",
								minHeight: "100px",
								padding: "12px",
								border: "1px solid #ccc",
								borderRadius: "4px",
								fontFamily: "inherit",
								fontSize: "14px",
								resize: "vertical",
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={() => selectedReport && handleRejectReport(selectedReport.id)}
						variant="contained"
						color="error"
						disabled={!rejectNotes.trim() || processingReport === selectedReport?.id}
					>
						{processingReport === selectedReport?.id ? "Rejecting..." : "Reject Report"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
