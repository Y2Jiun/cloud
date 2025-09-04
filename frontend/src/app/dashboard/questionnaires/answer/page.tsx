"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	Radio,
	RadioGroup,
	Slider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { CheckIcon, PlayIcon } from "@phosphor-icons/react";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

interface Question {
	id: number;
	questionText: string;
	questionType: "text" | "multiple_choice" | "checkbox" | "rating";
	options?: string[];
	isRequired: boolean;
}

interface Questionnaire {
	id: number;
	title: string;
	description?: string;
	createdByUser: {
		username: string;
		name?: string;
	};
	questions: Question[];
}

interface Answer {
	questionId: number;
	answerText?: string;
	answerOptions?: string[];
	answerRating?: number;
}

export default function AnswerQuestionnairesPage(): React.JSX.Element {
	const { user } = useUser();
	const router = useRouter();
	const [questionnaires, setQuestionnaires] = React.useState<Questionnaire[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [selectedQuestionnaire, setSelectedQuestionnaire] = React.useState<Questionnaire | null>(null);
	const [answerDialogOpen, setAnswerDialogOpen] = React.useState(false);
	const [answers, setAnswers] = React.useState<Answer[]>([]);
	const [submitting, setSubmitting] = React.useState(false);

	// Fetch active questionnaires
	const fetchQuestionnaires = React.useCallback(async () => {
		try {
			const response = await apiClient.get("/questionnaires/active");
			if (response.success) {
				setQuestionnaires(response.data);
			}
		} catch (error) {
			console.error("Error fetching questionnaires:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchQuestionnaires();
	}, [fetchQuestionnaires]);

	const handleStartQuestionnaire = (questionnaire: Questionnaire) => {
		setSelectedQuestionnaire(questionnaire);
		setAnswers(
			questionnaire.questions.map((q) => ({
				questionId: q.id,
				answerText: "",
				answerOptions: [],
				answerRating: 0,
			}))
		);
		setAnswerDialogOpen(true);
	};

	const handleAnswerChange = (questionIndex: number, value: any, type: keyof Answer) => {
		setAnswers((prev) =>
			prev.map((answer, index) => {
				if (index === questionIndex) {
					return { ...answer, [type]: value };
				}
				return answer;
			})
		);
	};

	const handleSubmitQuestionnaire = async () => {
		if (!selectedQuestionnaire) return;

		// Validate required questions
		const requiredQuestions = selectedQuestionnaire.questions.filter((q) => q.isRequired);
		const missingAnswers = requiredQuestions.filter((q) => {
			const answer = answers.find((a) => a.questionId === q.id);
			if (!answer) return true;

			if (q.questionType === "text" && !answer.answerText?.trim()) return true;
			if (q.questionType === "multiple_choice" && !answer.answerOptions?.length) return true;
			if (q.questionType === "checkbox" && !answer.answerOptions?.length) return true;
			if (q.questionType === "rating" && answer.answerRating === undefined) return true;

			return false;
		});

		if (missingAnswers.length > 0) {
			alert("Please answer all required questions.");
			return;
		}

		setSubmitting(true);
		try {
			const response = await apiClient.post(`/questionnaires/${selectedQuestionnaire.id}/respond`, {
				questionnaireId: selectedQuestionnaire.id,
				answers,
			});

			if (response.success) {
				setAnswerDialogOpen(false);
				setSelectedQuestionnaire(null);
				setAnswers([]);
				alert("Questionnaire submitted successfully!");
				fetchQuestionnaires();
			}
		} catch (error) {
			console.error("Error submitting questionnaire:", error);
			alert("Failed to submit questionnaire. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const renderQuestionInput = (question: Question, questionIndex: number) => {
		const answer = answers.find((a) => a.questionId === question.id);

		switch (question.questionType) {
			case "text":
				return (
					<TextField
						label="Your Answer"
						value={answer?.answerText || ""}
						onChange={(e) => handleAnswerChange(questionIndex, e.target.value, "answerText")}
						fullWidth
						multiline
						rows={3}
						required={question.isRequired}
					/>
				);

			case "multiple_choice":
				return (
					<FormControl component="fieldset" required={question.isRequired}>
						<FormLabel component="legend">Select one option:</FormLabel>
						<RadioGroup
							value={answer?.answerOptions?.[0] || ""}
							onChange={(e) => handleAnswerChange(questionIndex, [e.target.value], "answerOptions")}
						>
							{question.options?.map((option, optionIndex) => (
								<FormControlLabel key={optionIndex} value={option} control={<Radio />} label={option} />
							))}
						</RadioGroup>
					</FormControl>
				);

			case "checkbox":
				return (
					<FormControl component="fieldset" required={question.isRequired}>
						<FormLabel component="legend">Select all that apply:</FormLabel>
						<FormGroup>
							{question.options?.map((option, optionIndex) => (
								<FormControlLabel
									key={optionIndex}
									control={
										<Checkbox
											checked={answer?.answerOptions?.includes(option) || false}
											onChange={(e) => {
												const currentOptions = answer?.answerOptions || [];
												const newOptions = e.target.checked
													? [...currentOptions, option]
													: currentOptions.filter((opt) => opt !== option);
												handleAnswerChange(questionIndex, newOptions, "answerOptions");
											}}
										/>
									}
									label={option}
								/>
							))}
						</FormGroup>
					</FormControl>
				);

			case "rating":
				return (
					<FormControl fullWidth required={question.isRequired}>
						<FormLabel component="legend">Rate from 1 to 10:</FormLabel>
						<Slider
							value={answer?.answerRating || 0}
							onChange={(_, value) => handleAnswerChange(questionIndex, value, "answerRating")}
							min={1}
							max={10}
							marks
							valueLabelDisplay="auto"
						/>
						<Typography variant="body2" color="text.secondary">
							Current rating: {answer?.answerRating || 0}
						</Typography>
					</FormControl>
				);

			default:
				return null;
		}
	};

	if (loading) {
		return (
			<Box>
				<Typography>Loading questionnaires...</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Answer Questionnaires
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Complete questionnaires created by legal officers to help gather information and insights.
				</Typography>
			</Box>

			{questionnaires.length === 0 ? (
				<Alert severity="info">No active questionnaires available at the moment. Check back later!</Alert>
			) : (
				<Grid container spacing={3}>
					{questionnaires.map((questionnaire) => (
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
											<Typography variant="caption" color="text.secondary">
												Created by: {questionnaire.createdByUser.name || questionnaire.createdByUser.username}
											</Typography>
											<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
												<Chip label={`${questionnaire.questions.length} questions`} color="primary" size="small" />
												<Chip label="Active" color="success" size="small" />
											</Stack>
										</Box>

										<Button
											variant="contained"
											startIcon={<PlayIcon />}
											onClick={() => handleStartQuestionnaire(questionnaire)}
											fullWidth
										>
											Start Questionnaire
										</Button>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Answer Questionnaire Dialog */}
			<Dialog open={answerDialogOpen} onClose={() => setAnswerDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>{selectedQuestionnaire?.title}</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 2 }}>
						<Typography variant="body2" color="text.secondary">
							{selectedQuestionnaire?.description}
						</Typography>

						{selectedQuestionnaire?.questions.map((question, index) => (
							<Card key={question.id} sx={{ p: 2 }}>
								<Stack spacing={2}>
									<Typography variant="h6">
										Question {index + 1}
										{question.isRequired && (
											<Typography component="span" color="error" sx={{ ml: 1 }}>
												*
											</Typography>
										)}
									</Typography>
									<Typography variant="body1" gutterBottom>
										{question.questionText}
									</Typography>

									{renderQuestionInput(question, index)}
								</Stack>
							</Card>
						))}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setAnswerDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleSubmitQuestionnaire}
						variant="contained"
						startIcon={<CheckIcon />}
						disabled={submitting}
					>
						{submitting ? "Submitting..." : "Submit Answers"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}




