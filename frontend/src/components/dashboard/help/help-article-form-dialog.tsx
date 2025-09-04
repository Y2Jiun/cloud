"use client";

import * as React from "react";
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";

import type { HelpArticle } from "./help-articles-table";

interface HelpArticleFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<HelpArticle>) => void;
	article?: HelpArticle | null;
}

const categoryOptions = [
	{ value: "FAQ", label: "FAQ" },
	{ value: "GUIDE", label: "Guide" },
	{ value: "TUTORIAL", label: "Tutorial" },
	{ value: "POLICY", label: "Policy" },
];

const commonTags = [
	"reporting",
	"scam",
	"beginner",
	"advanced",
	"security",
	"privacy",
	"legal",
	"prevention",
	"education",
	"account",
	"troubleshooting",
	"features",
];

export function HelpArticleFormDialog({
	open,
	onClose,
	onSubmit,
	article,
}: HelpArticleFormDialogProps): React.JSX.Element {
	const [formData, setFormData] = React.useState({
		title: "",
		content: "",
		category: "FAQ" as const,
		tags: [] as string[],
		isPublished: false,
		isPinned: false,
	});

	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// Reset form when dialog opens/closes or article changes
	React.useEffect(() => {
		if (open) {
			if (article) {
				setFormData({
					title: article.title,
					content: article.content,
					category: article.category,
					tags: Array.isArray(article.tags)
						? article.tags
						: (article.tags || "").split(",").filter((tag) => tag.trim()),
					isPublished: article.isPublished,
					isPinned: article.isPinned,
				});
			} else {
				setFormData({
					title: "",
					content: "",
					category: "FAQ",
					tags: [],
					isPublished: false,
					isPinned: false,
				});
			}
			setErrors({});
		}
	}, [open, article]);

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!formData.content.trim()) {
			newErrors.content = "Content is required";
		}

		if (formData.content.trim().length < 50) {
			newErrors.content = "Content must be at least 50 characters long";
		}

		if (formData.tags.length === 0) {
			newErrors.tags = "At least one tag is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}

		onSubmit(formData);
	};

	const isEditing = !!article;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>{isEditing ? "Edit Help Article" : "Create New Help Article"}</DialogTitle>

			<DialogContent>
				<Stack spacing={3} sx={{ mt: 1 }}>
					{/* Title */}
					<TextField
						label="Title"
						value={formData.title}
						onChange={(e) => handleChange("title", e.target.value)}
						error={!!errors.title}
						helperText={errors.title}
						fullWidth
						required
					/>

					{/* Category */}
					<FormControl fullWidth>
						<InputLabel>Category</InputLabel>
						<Select
							value={formData.category}
							label="Category"
							onChange={(e) => handleChange("category", e.target.value)}
						>
							{categoryOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Tags */}
					<Autocomplete
						multiple
						options={commonTags}
						value={formData.tags}
						onChange={(_, newValue) => handleChange("tags", newValue)}
						freeSolo
						renderTags={(value, getTagProps) =>
							(Array.isArray(value) ? value : []).map((option, index) => (
								<Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Tags"
								placeholder="Add tags..."
								error={!!errors.tags}
								helperText={errors.tags || "Press Enter to add custom tags"}
							/>
						)}
					/>

					{/* Content */}
					<TextField
						label="Content"
						value={formData.content}
						onChange={(e) => handleChange("content", e.target.value)}
						error={!!errors.content}
						helperText={errors.content || `${formData.content.length} characters`}
						multiline
						rows={8}
						fullWidth
						required
					/>

					{/* Status Options */}
					<Box>
						<Stack spacing={2}>
							<FormControlLabel
								control={
									<Switch
										checked={formData.isPublished}
										onChange={(e) => handleChange("isPublished", e.target.checked)}
									/>
								}
								label="Published (visible to users)"
							/>
							<FormControlLabel
								control={
									<Switch checked={formData.isPinned} onChange={(e) => handleChange("isPinned", e.target.checked)} />
								}
								label="Pinned (appears at top of list)"
							/>
						</Stack>
					</Box>

					{/* Preview */}
					{formData.content && (
						<Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
							<Typography variant="subtitle2" gutterBottom>
								Content Preview:
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{formData.content.substring(0, 200)}
								{formData.content.length > 200 && "..."}
							</Typography>
						</Box>
					)}
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleSubmit} variant="contained">
					{isEditing ? "Update" : "Create"} Article
				</Button>
			</DialogActions>
		</Dialog>
	);
}
