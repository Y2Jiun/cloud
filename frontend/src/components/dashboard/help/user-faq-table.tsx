"use client";

import * as React from "react";
import {
	Box,
	Card,
	Chip,
	IconButton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";

export interface UserFAQ {
	id: string;
	title: string;
	content: string;
	category: "GUIDE" | "FAQ" | "TUTORIAL";
	tags: string;
	views: number;
	helpful: number;
	createdAt: Date;
	updatedAt: Date;
	createdByUser: {
		username: string;
	};
}

// Hook to fetch published FAQs for users
function useUserFAQs() {
	const [faqs, setFaqs] = React.useState<UserFAQ[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchFAQs = React.useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiClient.getAllFAQs({ status: "published" });

			if (response.success && response.data) {
				// Transform backend data to frontend format
				const transformedFaqs = response.data.map((faq: any) => ({
					id: faq.id.toString(),
					title: faq.title,
					content: faq.content,
					category: faq.category,
					tags: faq.tags || "",
					views: faq.views || 0,
					helpful: faq.helpful || 0,
					createdAt: new Date(faq.createdAt),
					updatedAt: new Date(faq.updatedAt),
					createdByUser: {
						username: faq.createdByUser?.username || "Unknown",
					},
				}));
				setFaqs(transformedFaqs);
			} else {
				setError(response.error || "Failed to fetch FAQs");
			}
		} catch (err) {
			console.error("Error fetching FAQs:", err);
			setError("Failed to fetch FAQs");
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchFAQs();
	}, [fetchFAQs]);

	return {
		faqs,
		loading,
		error,
		refetch: fetchFAQs,
	};
}

interface UserFAQTableProps {
	count?: number;
	rows?: UserFAQ[];
	page?: number;
	rowsPerPage?: number;
}

export function UserFAQTable({ count, rows, page = 0, rowsPerPage = 10 }: UserFAQTableProps): React.JSX.Element {
	const { faqs, loading, error, refetch } = useUserFAQs();

	const actualRows = rows || faqs;
	const actualCount = count || faqs.length;

	const handleMarkHelpful = async (id: string) => {
		try {
			const response = await apiClient.markFAQHelpful(id);
			if (response.success) {
				toast.success("Thank you for your feedback!");
				refetch(); // Refresh to update helpful count
			} else {
				toast.error("Failed to mark as helpful");
			}
		} catch (error) {
			toast.error("Failed to mark as helpful");
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "GUIDE":
				return "primary";
			case "FAQ":
				return "secondary";
			case "TUTORIAL":
				return "success";
			default:
				return "default";
		}
	};

	// Show loading state
	if (loading) {
		return (
			<Card>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Typography>Loading help articles...</Typography>
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
		<Card>
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: "800px" }}>
					<TableHead>
						<TableRow>
							<TableCell>Article</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Author</TableCell>
							<TableCell>Views</TableCell>
							<TableCell>Helpful</TableCell>
							<TableCell>Last Updated</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{actualRows.map((row) => (
							<TableRow hover key={row.id}>
								<TableCell>
									<Stack sx={{ alignItems: "flex-start" }} direction="column" spacing={1}>
										<Typography variant="subtitle2">{row.title}</Typography>
										<Typography color="text.secondary" variant="body2">
											{row.content.length > 100 ? `${row.content.substring(0, 100)}...` : row.content}
										</Typography>
										{row.tags && (
											<Stack direction="row" spacing={0.5} flexWrap="wrap">
												{row.tags.split(",").map((tag, index) => (
													<Chip key={index} label={tag.trim()} size="small" variant="outlined" />
												))}
											</Stack>
										)}
									</Stack>
								</TableCell>
								<TableCell>
									<Chip color={getCategoryColor(row.category) as any} label={row.category} size="small" />
								</TableCell>
								<TableCell>
									<Typography variant="body2">{row.createdByUser.username}</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="body2">{row.views}</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="body2">{row.helpful}</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="body2">{row.updatedAt.toLocaleDateString()}</Typography>
								</TableCell>
								<TableCell>
									<Stack direction="row" spacing={1}>
										<IconButton
											size="small"
											title="View Article Details"
											onClick={() => {
												// TODO: Implement view details functionality
												toast.info("View details functionality coming soon!");
											}}
										>
											<EyeIcon />
										</IconButton>
										<IconButton
											size="small"
											title="Mark as Helpful"
											onClick={() => handleMarkHelpful(row.id)}
											sx={{ color: "success.main" }}
										>
											👍
										</IconButton>
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>
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
	);
}




