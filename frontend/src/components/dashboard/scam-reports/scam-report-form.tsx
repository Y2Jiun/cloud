"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Divider,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";

interface ScamReportFormData {
	title: string;
	description: string;
	scammerInfo: string;
	platform: string;
}

const platforms = [
	"Facebook",
	"Instagram",
	"WhatsApp",
	"Telegram",
	"Email",
	"Phone Call",
	"SMS",
	"Website",
	"Dating App",
	"E-commerce",
	"Cryptocurrency",
	"Investment Platform",
	"Other",
];

export function ScamReportForm(): React.JSX.Element {
	const router = useRouter();
	const [formData, setFormData] = React.useState<ScamReportFormData>({
		title: "",
		description: "",
		scammerInfo: "",
		platform: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [errors, setErrors] = React.useState<Partial<ScamReportFormData>>({});

	const handleInputChange =
		(field: keyof ScamReportFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setFormData((prev) => ({
				...prev,
				[field]: event.target.value,
			}));
			// Clear error when user starts typing
			if (errors[field]) {
				setErrors((prev) => ({
					...prev,
					[field]: undefined,
				}));
			}
		};

	const handleSelectChange = (event: any) => {
		setFormData((prev) => ({
			...prev,
			platform: event.target.value,
		}));
		if (errors.platform) {
			setErrors((prev) => ({
				...prev,
				platform: undefined,
			}));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<ScamReportFormData> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}
		if (!formData.description.trim()) {
			newErrors.description = "Description is required";
		}
		if (!formData.scammerInfo.trim()) {
			newErrors.scammerInfo = "Scammer information is required";
		}
		if (!formData.platform) {
			newErrors.platform = "Platform is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await apiClient.createScamReport(formData);

			if (response.success || response.message) {
				toast.success("Scam report created successfully!");
				router.push("/dashboard/scam-reports");
			} else {
				throw new Error(response.error || "Failed to create scam report");
			}
		} catch (error: any) {
			console.error("Error creating scam report:", error);
			toast.error(error.message || "Failed to create scam report");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard/scam-reports");
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader title="Create New Scam Report" subheader="Report a scam to help protect others" />
				<Divider />
				<CardContent>
					<Stack spacing={3}>
						<FormControl error={Boolean(errors.title)}>
							<InputLabel>Report Title</InputLabel>
							<OutlinedInput
								label="Report Title"
								value={formData.title}
								onChange={handleInputChange("title")}
								placeholder="Brief title describing the scam"
							/>
							{errors.title && <FormHelperText>{errors.title}</FormHelperText>}
						</FormControl>

						<FormControl error={Boolean(errors.platform)}>
							<InputLabel>Platform</InputLabel>
							<Select label="Platform" value={formData.platform} onChange={handleSelectChange}>
								{platforms.map((platform) => (
									<MenuItem key={platform} value={platform}>
										{platform}
									</MenuItem>
								))}
							</Select>
							{errors.platform && <FormHelperText>{errors.platform}</FormHelperText>}
						</FormControl>

						<FormControl error={Boolean(errors.description)}>
							<TextField
								label="Description"
								multiline
								rows={4}
								value={formData.description}
								onChange={handleInputChange("description")}
								placeholder="Detailed description of what happened..."
								error={Boolean(errors.description)}
								helperText={errors.description}
							/>
						</FormControl>

						<FormControl error={Boolean(errors.scammerInfo)}>
							<TextField
								label="Scammer Information"
								multiline
								rows={3}
								value={formData.scammerInfo}
								onChange={handleInputChange("scammerInfo")}
								placeholder="Phone numbers, email addresses, usernames, or any identifying information..."
								error={Boolean(errors.scammerInfo)}
								helperText={errors.scammerInfo}
							/>
						</FormControl>
					</Stack>
				</CardContent>
				<Divider />
				<Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
					<Stack direction="row" spacing={2}>
						<Button color="inherit" onClick={handleCancel} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" variant="contained" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Report"}
						</Button>
					</Stack>
				</Box>
			</Card>
		</form>
	);
}
