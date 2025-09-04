"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { Download as DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FileText as FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Upload as UploadIcon } from "@phosphor-icons/react/dist/ssr/Upload";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useSelection } from "@/hooks/use-selection";
import { useUser } from "@/hooks/use-user";

function noop(): void {
	// do nothing
}

export interface LegalCase {
	id: string;
	title: string;
	description: string;
	caseNumber: string;
	status: "pending" | "approved" | "rejected" | "closed";
	priority: "HIGH" | "MEDIUM" | "LOW";
	adminNotes?: string;
	isActive: boolean;
	createdBy: number;
	approvedBy?: number;
	createdAt: Date;
	updatedAt: Date;
	createdByUser: {
		username: string;
		name?: string;
		email: string;
	};
	approvedByUser?: {
		username: string;
		name?: string;
		email: string;
	};
	documents: {
		id: number;
		title: string;
		fileName: string;
		fileType: string;
		fileSize: number;
		createdAt: Date;
	}[];
	evidence: {
		id: number;
		title: string;
		createdAt: Date;
	}[];
	scamReports: {
		id: number;
		title: string;
		status: string;
		createdAt: Date;
	}[];
}

// Hook to fetch legal cases from backend
function useLegalCases() {
	const { user } = useUser();
	const [cases, setCases] = React.useState<LegalCase[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchCases = React.useCallback(async () => {
		try {
			setLoading(true);
			let response;

			// Different API calls based on user role
			if (user?.roles === 1) {
				// Admin - see all cases
				response = await apiClient.getLegalCases();
			} else if (user?.roles === 2) {
				// Legal Officer - see own cases + approved
				response = await apiClient.getLegalCases();
			} else {
				// Regular user - see only approved cases
				response = await apiClient.getLegalCases({ status: "approved" });
			}

			if (response.success && response.data) {
				// Transform backend data to frontend format
				const transformedCases: LegalCase[] = response.data.map((caseItem: any) => ({
					id: caseItem.id.toString(),
					title: caseItem.title,
					description: caseItem.description,
					caseNumber: caseItem.caseNumber,
					status: caseItem.status,
					priority: caseItem.priority,
					adminNotes: caseItem.adminNotes,
					isActive: caseItem.isActive,
					createdBy: caseItem.createdBy,
					approvedBy: caseItem.approvedBy,
					createdAt: new Date(caseItem.createdAt),
					updatedAt: new Date(caseItem.updatedAt),
					createdByUser: caseItem.createdByUser,
					approvedByUser: caseItem.approvedByUser,
					documents: caseItem.documents || [],
					evidence: caseItem.evidence || [],
					scamReports: caseItem.scamReports || [],
				}));

				setCases(transformedCases);
			} else {
				setError(response.error || "Failed to fetch legal cases");
			}
		} catch (err) {
			console.error("Error fetching legal cases:", err);
			setError("Failed to fetch legal cases");
		} finally {
			setLoading(false);
		}
	}, [user?.roles]);

	React.useEffect(() => {
		fetchCases();
	}, [fetchCases]);

	return { cases, loading, error, refetch: fetchCases };
}

interface LegalCasesTableProps {
	count?: number;
	page?: number;
	rows?: LegalCase[];
	rowsPerPage?: number;
}

export function LegalCasesTable({ count, rows, page = 0, rowsPerPage = 10 }: LegalCasesTableProps): React.JSX.Element {
	const { cases, loading, error, refetch } = useLegalCases();
	const { user: currentUser } = useUser();

	// Use real data if no props provided, otherwise use props (for flexibility)
	const actualRows = rows || cases;
	const actualCount = count || cases.length;

	// CRUD Dialog States
	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [selectedCase, setSelectedCase] = React.useState<LegalCase | null>(null);
	const [formData, setFormData] = React.useState({
		title: "",
		description: "",
		caseNumber: "",
		priority: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
	});

	// Admin approval states
	const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false);
	const [approvalAction, setApprovalAction] = React.useState<"approve" | "reject">("approve");
	const [adminNotes, setAdminNotes] = React.useState("");

	// Document upload states
	const [documentDialogOpen, setDocumentDialogOpen] = React.useState(false);
	const [documentFormData, setDocumentFormData] = React.useState({
		title: "",
		description: "",
		fileName: "",
		fileUrl: "",
		fileType: "",
		fileSize: 0,
	});

	// Add new state for file upload dialog
	const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
	const [uploadFormData, setUploadFormData] = React.useState({
		title: "",
		description: "",
	});
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [uploading, setUploading] = React.useState(false);

	// File upload handlers
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Check file type
			const allowedTypes = [
				"application/pdf",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			];
			if (!allowedTypes.includes(file.type)) {
				toast.error("Please select a PDF or Word document");
				return;
			}

			// Check file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size must be less than 10MB");
				return;
			}

			setSelectedFile(file);
			setUploadFormData((prev) => ({ ...prev, title: file.name }));
		}
	};

	const handleUploadDocument = async () => {
		if (!selectedFile || !selectedCase) return;

		try {
			setUploading(true);

			const formData = new FormData();
			formData.append("document", selectedFile);
			formData.append("title", uploadFormData.title);
			formData.append("description", uploadFormData.description);

			await apiClient.uploadDocument(selectedCase.id, formData);

			toast.success("Document uploaded successfully");
			setUploadDialogOpen(false);
			setSelectedFile(null);
			setUploadFormData({ title: "", description: "" });

			// Refresh the cases to show the new document
			refetch();
		} catch (error) {
			console.error("Error uploading document:", error);
			toast.error("Failed to upload document");
		} finally {
			setUploading(false);
		}
	};

	const openUploadDialog = (legalCase: LegalCase) => {
		setSelectedCase(legalCase);
		setUploadDialogOpen(true);
	};

	const closeUploadDialog = () => {
		setUploadDialogOpen(false);
		setSelectedFile(null);
		setUploadFormData({ title: "", description: "" });
		setSelectedCase(null);
	};

	// Document download handler
	const handleDownloadDocument = async (documentId: number) => {
		try {
			const response = await apiClient.downloadDocument(documentId.toString());

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `document-${documentId}`;
				a.click();
				window.URL.revokeObjectURL(url);
				toast.success("Document downloaded successfully");
			} else {
				toast.error("Failed to download document");
			}
		} catch (error) {
			console.error("Error downloading document:", error);
			toast.error("Failed to download document");
		}
	};

	// CRUD Functions
	const handleCreate = async () => {
		try {
			const response = await apiClient.createLegalCase({
				title: formData.title,
				description: formData.description,
				caseNumber: formData.caseNumber,
				priority: formData.priority,
			});

			if (response.success) {
				toast.success("Legal case created successfully!");
				setCreateDialogOpen(false);
				resetForm();
				refetch();
			} else {
				toast.error(response.error || "Failed to create legal case");
			}
		} catch (error) {
			console.error("Error creating legal case:", error);
			toast.error("Failed to create legal case");
		}
	};

	const handleEdit = async () => {
		if (!selectedCase) return;

		try {
			const response = await apiClient.updateLegalCase(selectedCase.id, {
				title: formData.title,
				description: formData.description,
				priority: formData.priority,
			});

			if (response.success) {
				toast.success("Legal case updated successfully!");
				setEditDialogOpen(false);
				resetForm();
				refetch();
			} else {
				toast.error(response.error || "Failed to update legal case");
			}
		} catch (error) {
			console.error("Error updating legal case:", error);
			toast.error("Failed to update legal case");
		}
	};

	const handleDelete = async () => {
		if (!selectedCase) return;

		try {
			const response = await apiClient.deleteLegalCase(selectedCase.id);

			if (response.success) {
				toast.success("Legal case deleted successfully!");
				setDeleteDialogOpen(false);
				refetch();
			} else {
				toast.error(response.error || "Failed to delete legal case");
			}
		} catch (error) {
			console.error("Error deleting legal case:", error);
			toast.error("Failed to delete legal case");
		}
	};

	const handleApproval = async () => {
		if (!selectedCase) return;

		try {
			let response;
			if (approvalAction === "approve") {
				response = await apiClient.approveLegalCase(selectedCase.id, adminNotes);
			} else {
				response = await apiClient.rejectLegalCase(selectedCase.id, adminNotes);
			}

			if (response.success) {
				toast.success(`Legal case ${approvalAction}d successfully!`);
				setApprovalDialogOpen(false);
				refetch();
			} else {
				toast.error(response.error || `Failed to ${approvalAction} legal case`);
			}
		} catch (error) {
			console.error(`Error ${approvalAction}ing legal case:`, error);
			toast.error(`Failed to ${approvalAction} legal case`);
		}
	};

	const handleDocumentUpload = async () => {
		if (!selectedCase) return;

		try {
			const response = await apiClient.uploadDocument(selectedCase.id, documentFormData);

			if (response.success) {
				toast.success("Document uploaded successfully!");
				setDocumentDialogOpen(false);
				resetDocumentForm();
				refetch();
			} else {
				toast.error(response.error || "Failed to upload document");
			}
		} catch (error) {
			console.error("Error uploading document:", error);
			toast.error("Failed to upload document");
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			caseNumber: "",
			priority: "MEDIUM",
		});
		setSelectedCase(null);
		setAdminNotes("");
	};

	const resetDocumentForm = () => {
		setDocumentFormData({
			title: "",
			description: "",
			fileName: "",
			fileUrl: "",
			fileType: "",
			fileSize: 0,
		});
		setSelectedCase(null);
	};

	const openEditDialog = (caseItem: LegalCase) => {
		setSelectedCase(caseItem);
		setFormData({
			title: caseItem.title,
			description: caseItem.description,
			caseNumber: caseItem.caseNumber,
			priority: caseItem.priority,
		});
		setEditDialogOpen(true);
	};

	const openApprovalDialog = (caseItem: LegalCase, action: "approve" | "reject") => {
		setSelectedCase(caseItem);
		setApprovalAction(action);
		setAdminNotes("");
		setApprovalDialogOpen(true);
	};

	const openDocumentDialog = (caseItem: LegalCase) => {
		setSelectedCase(caseItem);
		setDocumentDialogOpen(true);
	};

	const rowIds = React.useMemo(() => {
		return actualRows.map((caseItem) => caseItem.id);
	}, [actualRows]);

	const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

	const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < actualRows.length;
	const selectedAll = actualRows.length > 0 && selected?.size === actualRows.length;

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography>Loading legal cases...</Typography>
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
			{/* Create Button for Legal Officers only */}
			{currentUser?.roles === 2 && (
				<Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
					<Button variant="contained" startIcon={<PlusIcon />} onClick={() => setCreateDialogOpen(true)}>
						Create Legal Case
					</Button>
				</Box>
			)}

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
								<TableCell>Case</TableCell>
								<TableCell>Case Number</TableCell>
								<TableCell>Priority</TableCell>
								<TableCell>Created By</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Documents</TableCell>
								<TableCell>Created</TableCell>
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
											<Typography variant="body2">{row.caseNumber}</Typography>
										</TableCell>
										<TableCell>
											<Chip
												color={row.priority === "HIGH" ? "error" : row.priority === "MEDIUM" ? "warning" : "success"}
												label={row.priority}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
												<Avatar src={row.createdByUser.profilepic} />
												<Stack sx={{ alignItems: "flex-start" }} direction="column" spacing={0}>
													<Typography variant="subtitle2">
														{row.createdByUser.name || row.createdByUser.username}
													</Typography>
													<Typography color="text.secondary" variant="body2">
														{row.createdByUser.email}
													</Typography>
												</Stack>
											</Stack>
										</TableCell>
										<TableCell>
											<Chip
												color={row.status === "approved" ? "success" : row.status === "rejected" ? "error" : "warning"}
												label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={1} alignItems="center">
												<FileTextIcon size={16} />
												<Typography variant="body2">{row.documents.length}</Typography>

												{/* Show upload button only for Legal Officers who created the case */}
												{currentUser?.roles === 2 && row.createdBy === currentUser.userid && (
													<IconButton size="small" title="Upload Document" onClick={() => openUploadDialog(row)}>
														<UploadIcon size={16} />
													</IconButton>
												)}

												{/* Show download button based on user role and case status */}
												{(currentUser?.roles === 1 || // Admin can download all
													(currentUser?.roles === 2 && row.createdBy === currentUser.userid) || // Legal Officer can download their own cases
													(currentUser?.roles === 3 && row.status === "approved")) && // Regular user can download only approved cases
													row.documents.length > 0 && (
														<IconButton
															size="small"
															title={
																currentUser?.roles === 3
																	? "Download Documents (Approved Cases Only)"
																	: "Download Documents"
															}
															onClick={() => {
																// Download the first document for now, could be enhanced to show a list
																if (row.documents.length > 0) {
																	handleDownloadDocument(row.documents[0].id);
																}
															}}
														>
															<DownloadIcon size={16} />
														</IconButton>
													)}
											</Stack>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.createdAt.toLocaleDateString()}</Typography>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={1}>
												<IconButton title="View Details">
													<EyeIcon />
												</IconButton>

												{/* Edit button for Legal Officers (own cases only) */}
												{currentUser?.roles === 2 && row.createdBy === currentUser.userid ? (
													<IconButton title="Edit Case" onClick={() => openEditDialog(row)}>
														<EditIcon />
													</IconButton>
												) : null}

												{/* Delete button for Legal Officers (own cases only) */}
												{currentUser?.roles === 2 && row.createdBy === currentUser.userid ? (
													<IconButton
														title="Delete Case"
														onClick={() => {
															setSelectedCase(row);
															setDeleteDialogOpen(true);
														}}
														color="error"
													>
														<TrashIcon />
													</IconButton>
												) : null}

												{/* Admin approval buttons */}
												{currentUser?.roles === 1 && row.status === "pending" && (
													<>
														<IconButton
															title="Approve Case"
															onClick={() => openApprovalDialog(row, "approve")}
															color="success"
														>
															<CheckIcon />
														</IconButton>
														<IconButton
															title="Reject Case"
															onClick={() => openApprovalDialog(row, "reject")}
															color="error"
														>
															<XIcon />
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
					onPageChange={noop}
					onRowsPerPageChange={noop}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
				/>
			</Card>

			{/* Create Legal Case Dialog */}
			<Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Create New Legal Case</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Title"
							fullWidth
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description"
							multiline
							rows={4}
							fullWidth
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required
						/>
						<TextField
							label="Case Number"
							fullWidth
							value={formData.caseNumber}
							onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
							required
							helperText="Unique case identifier"
						/>
						<FormControl fullWidth>
							<InputLabel>Priority</InputLabel>
							<Select
								value={formData.priority}
								label="Priority"
								onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
							>
								<MenuItem value="HIGH">High</MenuItem>
								<MenuItem value="MEDIUM">Medium</MenuItem>
								<MenuItem value="LOW">Low</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleCreate}
						variant="contained"
						disabled={!formData.title.trim() || !formData.description.trim() || !formData.caseNumber.trim()}
					>
						Create Case
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Legal Case Dialog */}
			<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Edit Legal Case</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Title"
							fullWidth
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description"
							multiline
							rows={4}
							fullWidth
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required
						/>
						<TextField
							label="Case Number"
							fullWidth
							value={formData.caseNumber}
							onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
							required
							disabled
							helperText="Case number cannot be changed"
						/>
						<FormControl fullWidth>
							<InputLabel>Priority</InputLabel>
							<Select
								value={formData.priority}
								label="Priority"
								onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
							>
								<MenuItem value="HIGH">High</MenuItem>
								<MenuItem value="MEDIUM">Medium</MenuItem>
								<MenuItem value="LOW">Low</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleEdit}
						variant="contained"
						disabled={!formData.title.trim() || !formData.description.trim()}
					>
						Update Case
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Legal Case</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete "{selectedCase?.title}"? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Admin Approval Dialog */}
			<Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Legal Case</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<Typography variant="body2">
							<strong>Case:</strong> {selectedCase?.title}
						</Typography>
						<Typography variant="body2">
							<strong>Case Number:</strong> {selectedCase?.caseNumber}
						</Typography>
						<Typography variant="body2">
							<strong>Created By:</strong> {selectedCase?.createdByUser.username}
						</Typography>
						<TextField
							label="Admin Notes"
							multiline
							rows={3}
							fullWidth
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder={
								approvalAction === "approve" ? "Optional notes for approval" : "Required notes for rejection"
							}
							required={approvalAction === "reject"}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleApproval}
						variant="contained"
						color={approvalAction === "approve" ? "success" : "error"}
						disabled={approvalAction === "reject" && !adminNotes.trim()}
					>
						{approvalAction === "approve" ? "Approve" : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Document Upload Dialog */}
			<Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Upload Document</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<Typography variant="body2">
							<strong>Case:</strong> {selectedCase?.title} ({selectedCase?.caseNumber})
						</Typography>
						<TextField
							label="Document Title"
							fullWidth
							value={documentFormData.title}
							onChange={(e) => setDocumentFormData({ ...documentFormData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description (Optional)"
							multiline
							rows={3}
							fullWidth
							value={documentFormData.description}
							onChange={(e) => setDocumentFormData({ ...documentFormData, description: e.target.value })}
						/>
						<TextField
							label="File Name"
							fullWidth
							value={documentFormData.fileName}
							onChange={(e) => setDocumentFormData({ ...documentFormData, fileName: e.target.value })}
							required
						/>
						<TextField
							label="File URL"
							fullWidth
							value={documentFormData.fileUrl}
							onChange={(e) => setDocumentFormData({ ...documentFormData, fileUrl: e.target.value })}
							required
							helperText="URL to the uploaded file"
						/>
						<Stack direction="row" spacing={2}>
							<TextField
								label="File Type"
								fullWidth
								value={documentFormData.fileType}
								onChange={(e) => setDocumentFormData({ ...documentFormData, fileType: e.target.value })}
								required
								placeholder="pdf, doc, docx, etc."
							/>
							<TextField
								label="File Size (bytes)"
								type="number"
								fullWidth
								value={documentFormData.fileSize}
								onChange={(e) => setDocumentFormData({ ...documentFormData, fileSize: parseInt(e.target.value) || 0 })}
								required
							/>
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleDocumentUpload}
						variant="contained"
						disabled={
							!documentFormData.title.trim() || !documentFormData.fileName.trim() || !documentFormData.fileUrl.trim()
						}
					>
						Upload Document
					</Button>
				</DialogActions>
			</Dialog>

			{/* File Upload Dialog */}
			<Dialog open={uploadDialogOpen} onClose={closeUploadDialog} maxWidth="md" fullWidth>
				<DialogTitle>Upload Document</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<Typography variant="body2">
							<strong>Case:</strong> {selectedCase?.title} ({selectedCase?.caseNumber})
						</Typography>
						<TextField
							label="Document Title"
							fullWidth
							value={uploadFormData.title}
							onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
							required
						/>
						<TextField
							label="Description (Optional)"
							multiline
							rows={3}
							fullWidth
							value={uploadFormData.description}
							onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
						/>
						<input
							type="file"
							accept=".pdf,.doc,.docx"
							onChange={handleFileSelect}
							style={{ display: "none" }}
							id="file-upload-input"
						/>
						<label htmlFor="file-upload-input">
							<Button variant="outlined" component="span" fullWidth>
								Select File
							</Button>
						</label>
						{selectedFile && <Typography variant="body2">Selected File: {selectedFile.name}</Typography>}
						{uploading && <Typography variant="body2">Uploading...</Typography>}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeUploadDialog} disabled={uploading}>
						Cancel
					</Button>
					<Button
						onClick={handleUploadDocument}
						variant="contained"
						disabled={!uploadFormData.title.trim() || !selectedFile || uploading}
					>
						{uploading ? "Uploading..." : "Upload Document"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
