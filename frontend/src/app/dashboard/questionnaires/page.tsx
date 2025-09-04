"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Snackbar,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { DownloadIcon, EyeIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface Question {
	id?: number;
	questionText: string;
	questionType: "text" | "multiple_choice" | "checkbox" | "rating";
	options?: string[];
	isRequired: boolean;
}

interface Questionnaire {
	id: number;
	title: string;
	description?: string;
	status: string;
	isActive: boolean;
	createdAt: string;
	_count: {
		responses: number;
	};
	questions: Question[];
}

export default function QuestionnairesPage(): React.JSX.Element {
	const { user } = useUser();
	const router = useRouter();
	const [questionnaires, setQuestionnaires] = React.useState<Questionnaire[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [selectedQuestionnaire, setSelectedQuestionnaire] = React.useState<Questionnaire | null>(null);
	const [snackbar, setSnackbar] = React.useState({
		open: false,
		message: "",
		severity: "error" as "error" | "success",
	});
	const [formData, setFormData] = React.useState({
		title: "",
		description: "",
		questions: [
			{
				questionText: "",
				questionType: "text" as const,
				options: [] as string[],
				isRequired: true,
			},
		],
	});

	// Check if user is a legal officer
	React.useEffect(() => {
		if (user && user.roles !== 2) {
			router.push("/dashboard");
		}
	}, [user, router]);

	// Fetch questionnaires
	const fetchQuestionnaires = React.useCallback(async () => {
		try {
			const response = await apiClient.get("/questionnaires/my");
			if (response.success) {
				console.log("Fetched questionnaires:", response.data);
				// Log each questionnaire's response count
				response.data.forEach((q: any) => {
					console.log(`Questionnaire ${q.id} (${q.title}): _count.responses = ${q._count?.responses}`);
				});
				setQuestionnaires(response.data);
			}
		} catch (error) {
			console.error("Error fetching questionnaires:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		if (user?.roles === 2) {
			fetchQuestionnaires();
		}
	}, [user, fetchQuestionnaires]);

	// Process questionnaires to parse options from JSON strings
	const processedQuestionnaires = React.useMemo(() => {
		return questionnaires.map((questionnaire) => ({
			...questionnaire,
			questions: questionnaire.questions.map((question) => ({
				...question,
				options: question.options
					? (() => {
							try {
								return JSON.parse(question.options);
							} catch (error) {
								console.error("Error parsing question options:", error);
								return [];
							}
						})()
					: [],
			})),
		}));
	}, [questionnaires]);

	const handleCreateQuestionnaire = async () => {
		try {
			// Validate form data
			if (!formData.title.trim()) {
				alert("Please enter a title for the questionnaire");
				return;
			}

			if (!formData.questions.length) {
				alert("Please add at least one question");
				return;
			}

			// Validate each question
			for (let i = 0; i < formData.questions.length; i++) {
				const question = formData.questions[i];
				if (!question.questionText.trim()) {
					alert(`Please enter text for question ${i + 1}`);
					return;
				}

				if (
					(question.questionType === "multiple_choice" || question.questionType === "checkbox") &&
					(!question.options || question.options.length === 0)
				) {
					alert(`Please add options for question ${i + 1}`);
					return;
				}
			}

			console.log("Submitting questionnaire data:", formData);

			const response = await apiClient.post("/questionnaires", formData);
			console.log("Response:", response);

			if (response.success) {
				setCreateDialogOpen(false);
				setFormData({
					title: "",
					description: "",
					questions: [
						{
							questionText: "",
							questionType: "text" as const,
							options: [] as string[],
							isRequired: true,
						},
					],
				});
				fetchQuestionnaires();
			} else {
				alert("Failed to create questionnaire: " + (response.error || "Unknown error"));
			}
		} catch (error) {
			console.error("Error creating questionnaire:", error);
			alert("Error creating questionnaire: " + (error instanceof Error ? error.message : "Unknown error"));
		}
	};

	const handleEditQuestionnaire = async () => {
		if (!selectedQuestionnaire) return;

		try {
			const response = await apiClient.put(`/questionnaires/${selectedQuestionnaire.id}`, formData);
			if (response.success) {
				setEditDialogOpen(false);
				setSelectedQuestionnaire(null);
				fetchQuestionnaires();
			}
		} catch (error) {
			console.error("Error updating questionnaire:", error);
		}
	};

	const handleDeleteQuestionnaire = async () => {
		if (!selectedQuestionnaire) return;

		try {
			const response = await apiClient.delete(`/questionnaires/${selectedQuestionnaire.id}`);
			if (response.success) {
				setDeleteDialogOpen(false);
				setSelectedQuestionnaire(null);
				fetchQuestionnaires();
			}
		} catch (error) {
			console.error("Error deleting questionnaire:", error);
		}
	};

	const handleToggleStatus = async (questionnaire: Questionnaire) => {
		try {
			const response = await apiClient.toggleQuestionnaireStatus(questionnaire.id, !questionnaire.isActive);
			if (response.success) {
				fetchQuestionnaires();
			}
		} catch (error) {
			console.error("Error toggling questionnaire status:", error);
		}
	};

	const handleExportCSV = async (questionnaireId: number) => {
		try {
			const response = await apiClient.exportQuestionnaireCSV(questionnaireId);

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `questionnaire-${questionnaireId}-responses.csv`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				console.error("CSV export failed:", response.status, response.statusText);
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData.error || "Failed to export CSV. Please try again.";

				// Show custom error message instead of browser alert
				if (errorMessage.includes("No responses found")) {
					setSnackbar({
						open: true,
						message: "Cannot download - No responses available for this questionnaire.",
						severity: "error",
					});
				} else {
					setSnackbar({ open: true, message: "Export failed - Please try again later.", severity: "error" });
				}
			}
		} catch (error) {
			console.error("Error exporting CSV:", error);
			setSnackbar({ open: true, message: "Error exporting CSV. Please try again.", severity: "error" });
		}
	};

	const handleExportPDF = async (questionnaireId: number) => {
		try {
			console.log("Exporting PDF for questionnaire ID:", questionnaireId);
			const response = await apiClient.exportQuestionnairePDF(questionnaireId);

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `questionnaire-${questionnaireId}-responses.pdf`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				console.error("PDF export failed:", response.status, response.statusText);
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData.error || "Failed to export PDF. Please try again.";

				// Show custom error message instead of browser alert
				if (errorMessage.includes("No responses found")) {
					setSnackbar({
						open: true,
						message: "Cannot download - No responses available for this questionnaire.",
						severity: "error",
					});
				} else {
					setSnackbar({ open: true, message: "Export failed - Please try again later.", severity: "error" });
				}
			}
		} catch (error) {
			console.error("Error exporting PDF:", error);
			setSnackbar({ open: true, message: "Error exporting PDF. Please try again.", severity: "error" });
		}
	};

	const addQuestion = () => {
		setFormData((prev) => ({
			...prev,
			questions: [
				...prev.questions,
				{
					questionText: "",
					questionType: "text" as const,
					options: [] as string[],
					isRequired: true,
				},
			],
		}));
	};

	const removeQuestion = (index: number) => {
		setFormData((prev) => ({
			...prev,
			questions: prev.questions.filter((_, i) => i !== index),
		}));
	};

	const updateQuestion = (index: number, field: keyof Question, value: any) => {
		setFormData((prev) => ({
			...prev,
			questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
		}));
	};

	if (user?.roles !== 2) {
		return (
			<Box>
				<Alert severity="error">
					You don't have permission to access this page. Only Legal Officers can manage questionnaires.
				</Alert>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box>
				<Typography>Loading questionnaires...</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Typography variant="h4" component="h1">
					Questionnaire Management
				</Typography>
				<Button variant="contained" startIcon={<PlusIcon />} onClick={() => setCreateDialogOpen(true)}>
					Create Questionnaire
				</Button>
			</Box>

			<Grid container spacing={3}>
				{processedQuestionnaires.map((questionnaire) => (
					<Grid item xs={12} md={6} lg={4} key={questionnaire.id}>
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Box>
										<Typography variant="h6" gutterBottom>
											{questionnaire.title}
										</Typography>
										<Typography variant="body2" color="text.secondary" gutterBottom>
											{questionnaire.description || "No description"}
										</Typography>
										<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
											<Chip
												label={questionnaire.isActive ? "Active" : "Inactive"}
												color={questionnaire.isActive ? "success" : "default"}
												size="small"
											/>
											<Chip label={`${questionnaire._count?.responses || 0} responses`} color="primary" size="small" />
										</Stack>
									</Box>

									<Stack direction="row" spacing={1} justifyContent="flex-end">
										<IconButton
											size="small"
											onClick={() => handleToggleStatus(questionnaire)}
											title={questionnaire.isActive ? "Deactivate" : "Activate"}
										>
											{questionnaire.isActive ? <PauseIcon /> : <PlayIcon />}
										</IconButton>
										<IconButton
											size="small"
											onClick={() => {
												setSelectedQuestionnaire(questionnaire);
												setFormData({
													title: questionnaire.title,
													description: questionnaire.description || "",
													questions: questionnaire.questions.map((q) => ({
														...q,
														options: Array.isArray(q.options) ? q.options : [],
													})),
												});
												setEditDialogOpen(true);
											}}
											title="Edit"
										>
											<PencilIcon />
										</IconButton>
										<IconButton size="small" onClick={() => handleExportCSV(questionnaire.id)} title="Export CSV">
											<DownloadIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => {
												console.log("Questionnaire object:", questionnaire);
												console.log("Questionnaire ID:", questionnaire.id);
												handleExportPDF(questionnaire.id);
											}}
											title="Export PDF"
										>
											<DownloadIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => {
												setSelectedQuestionnaire(questionnaire);
												setDeleteDialogOpen(true);
											}}
											title="Delete"
											color="error"
										>
											<TrashIcon />
										</IconButton>
									</Stack>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* Create Questionnaire Dialog */}
			<Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Create New Questionnaire</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 2 }}>
						<TextField
							label="Title"
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							fullWidth
						/>
						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
							fullWidth
							multiline
							rows={3}
						/>

						<Typography variant="h6">Questions</Typography>
						{formData.questions.map((question, index) => (
							<Card key={index} sx={{ p: 2 }}>
								<Stack spacing={2}>
									<TextField
										label={`Question ${index + 1}`}
										value={question.questionText}
										onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
										fullWidth
									/>
									<FormControl fullWidth>
										<InputLabel>Question Type</InputLabel>
										<Select
											value={question.questionType}
											onChange={(e) => updateQuestion(index, "questionType", e.target.value)}
											label="Question Type"
										>
											<MenuItem value="text">Text</MenuItem>
											<MenuItem value="multiple_choice">Multiple Choice</MenuItem>
											<MenuItem value="checkbox">Checkbox</MenuItem>
											<MenuItem value="rating">Rating</MenuItem>
										</Select>
									</FormControl>

									{(question.questionType === "multiple_choice" || question.questionType === "checkbox") && (
										<TextField
											label="Options (comma-separated)"
											placeholder="Option 1, Option 2, Option 3"
											value={question.options ? question.options.join(", ") : ""}
											onChange={(e) => {
												const options = e.target.value
													.split(",")
													.map((opt) => opt.trim())
													.filter((opt) => opt);
												updateQuestion(index, "options", options);
											}}
											fullWidth
										/>
									)}

									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<Button
											size="small"
											onClick={() => removeQuestion(index)}
											disabled={formData.questions.length === 1}
										>
											Remove Question
										</Button>
									</Box>
								</Stack>
							</Card>
						))}

						<Button onClick={addQuestion} variant="outlined">
							Add Question
						</Button>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleCreateQuestionnaire} variant="contained">
						Create
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Questionnaire Dialog */}
			<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Edit Questionnaire</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 2 }}>
						<TextField
							label="Title"
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							fullWidth
						/>
						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
							fullWidth
							multiline
							rows={3}
						/>

						<Typography variant="h6">Questions</Typography>
						{formData.questions.map((question, index) => (
							<Card key={index} sx={{ p: 2 }}>
								<Stack spacing={2}>
									<TextField
										label={`Question ${index + 1}`}
										value={question.questionText}
										onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
										fullWidth
									/>
									<FormControl fullWidth>
										<InputLabel>Question Type</InputLabel>
										<Select
											value={question.questionType}
											onChange={(e) => updateQuestion(index, "questionType", e.target.value)}
											label="Question Type"
										>
											<MenuItem value="text">Text</MenuItem>
											<MenuItem value="multiple_choice">Multiple Choice</MenuItem>
											<MenuItem value="checkbox">Checkbox</MenuItem>
											<MenuItem value="rating">Rating</MenuItem>
										</Select>
									</FormControl>

									{(question.questionType === "multiple_choice" || question.questionType === "checkbox") && (
										<TextField
											label="Options (comma-separated)"
											placeholder="Option 1, Option 2, Option 3"
											value={question.options ? question.options.join(", ") : ""}
											onChange={(e) => {
												const options = e.target.value
													.split(",")
													.map((opt) => opt.trim())
													.filter((opt) => opt);
												updateQuestion(index, "options", options);
											}}
											fullWidth
										/>
									)}

									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<Button
											size="small"
											onClick={() => removeQuestion(index)}
											disabled={formData.questions.length === 1}
										>
											Remove Question
										</Button>
									</Box>
								</Stack>
							</Card>
						))}

						<Button onClick={addQuestion} variant="outlined">
							Add Question
						</Button>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleEditQuestionnaire} variant="contained">
						Update
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Questionnaire</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete "{selectedQuestionnaire?.title}"? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDeleteQuestionnaire} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Custom Snackbar for notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
