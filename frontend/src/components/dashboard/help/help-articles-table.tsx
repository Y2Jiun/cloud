"use client";

import * as React from "react";
import {
	Box,
	Card,
	Checkbox,
	Chip,
	Divider,
	IconButton,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { toast } from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import { useSelection } from "@/hooks/use-selection";

import { HelpArticleFormDialog } from "./help-article-form-dialog";

function noop(): void {
	// do nothing
}

export interface HelpArticle {
	id: string;
	title: string;
	content: string;
	category: "GUIDE" | "FAQ" | "TUTORIAL";
	tags: string;
	isPublished: boolean;
	isPinned: boolean;
	views: number;
	helpful: number;
	createdAt: Date;
	updatedAt: Date;
	createdByUser: {
		username: string;
	};
}

// Hook to fetch FAQs from backend
function useFAQs() {
	const [faqs, setFaqs] = React.useState<HelpArticle[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// Define fetchFAQs function outside useEffect so it can be referenced
	const fetchFAQs = async () => {
		try {
			setLoading(true);
			const response = await apiClient.getAdminFAQs();

			if (response.success && response.data) {
				// Transform backend data to frontend format
				const transformedFaqs = response.data.map((faq: any) => ({
					id: faq.id.toString(),
					title: faq.title,
					content: faq.content,
					category: faq.category,
					tags: faq.tags || "",
					isPublished: faq.status === "published",
					isPinned: faq.isPinned,
					views: faq.views,
					helpful: faq.helpful,
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
	};

	React.useEffect(() => {
		fetchFAQs();
	}, []);

	return {
		faqs,
		loading,
		error,
		refetch: fetchFAQs,
	};
}

interface HelpArticlesTableProps {
	count?: number;
	rows?: HelpArticle[];
	page?: number;
	rowsPerPage?: number;
}

export const HelpArticlesTable = React.forwardRef<{ openCreateDialog: () => void }, HelpArticlesTableProps>(
	function HelpArticlesTable({ count, rows, page = 0, rowsPerPage = 10 }, ref) {
		const { faqs, loading, error, refetch } = useFAQs();
		const [formDialogOpen, setFormDialogOpen] = React.useState(false);
		const [editingArticle, setEditingArticle] = React.useState<HelpArticle | null>(null);

		// Expose openCreateDialog function to parent component
		React.useImperativeHandle(ref, () => ({
			openCreateDialog: () => {
				setEditingArticle(null);
				setFormDialogOpen(true);
			},
		}));

		const actualRows = rows || faqs;
		const actualCount = count || faqs.length;
		const rowIds = React.useMemo(() => {
			return actualRows.map((article) => article.id);
		}, [actualRows]);

		const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

		const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < actualRows.length;
		const selectedAll = actualRows.length > 0 && selected?.size === actualRows.length;

		const handleTogglePublished = async (id: string, isPublished: boolean) => {
			try {
				// Update the FAQ in the backend
				await apiClient.updateFAQ(id, { status: isPublished ? "published" : "draft" });
				// Refresh the data
				refetch();
				toast.success(`Article ${isPublished ? "published" : "unpublished"} successfully!`);
			} catch (error) {
				toast.error("Failed to update article status");
			}
		};

		const handleTogglePinned = async (id: string, isPinned: boolean) => {
			try {
				// Update the FAQ in the backend
				await apiClient.updateFAQ(id, { isPinned });
				// Refresh the data
				refetch();
				toast.success(`Article ${isPinned ? "pinned" : "unpinned"} successfully!`);
			} catch (error) {
				toast.error("Failed to update article pin status");
			}
		};

		const handleEdit = (article: HelpArticle) => {
			setEditingArticle(article);
			setFormDialogOpen(true);
		};

		const handleDelete = async (id: string) => {
			if (window.confirm("Are you sure you want to delete this article?")) {
				try {
					// Delete the FAQ from the backend
					await apiClient.deleteFAQ(id);
					// Refresh the data
					refetch();
					toast.success("Article deleted successfully!");
				} catch (error) {
					toast.error("Failed to delete article");
				}
			}
		};

		const handleFormSubmit = async (data: Partial<HelpArticle>) => {
			try {
				if (editingArticle) {
					// Update existing article
					const updateResult = await apiClient.updateFAQ(editingArticle.id, {
						title: data.title,
						content: data.content,
						category: data.category,
						tags: data.tags,
						status: data.isPublished ? "published" : "draft",
						isPinned: data.isPinned,
					});

					if (updateResult.success) {
						toast.success("Article updated successfully!");
						// Only refresh and close on success
						refetch();
						setFormDialogOpen(false);
						setEditingArticle(null);
					} else {
						toast.error(updateResult.error || "Failed to update article");
					}
				} else {
					// Create new article
					const createResult = await apiClient.createFAQ({
						title: data.title!,
						content: data.content!,
						category: data.category!,
						tags: data.tags || "",
						status: data.isPublished ? "published" : "draft",
						isPinned: data.isPinned || false,
					});

					if (createResult.success) {
						toast.success("Article created successfully!");
						// Only refresh and close on success
						refetch();
						setFormDialogOpen(false);
						setEditingArticle(null);
					} else {
						toast.error(createResult.error || "Failed to create article");
					}
				}
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("Failed to save article");
			}
		};

		const getCategoryColor = (category: string) => {
			switch (category) {
				case "FAQ":
					return "info";
				case "GUIDE":
					return "success";
				case "TUTORIAL":
					return "warning";
				default:
					return "default";
			}
		};

		if (loading) {
			return (
				<Card>
					<Box sx={{ p: 3, textAlign: "center" }}>
						<Typography>Loading FAQs...</Typography>
					</Box>
				</Card>
			);
		}

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
						<Table>
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
									<TableCell>Article</TableCell>
									<TableCell>Category</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>Stats</TableCell>
									<TableCell>Updated</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{actualRows.map((row, index) => {
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
													<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
														<Typography variant="subtitle2">{row.title}</Typography>
														{row.isPinned && <Chip label="PINNED" color="secondary" size="small" variant="outlined" />}
													</Stack>
													<Typography color="text.secondary" variant="body2">
														{row.content.length > 80 ? `${row.content.substring(0, 80)}...` : row.content}
													</Typography>
													<Stack direction="row" spacing={0.5}>
														{row.tags
															.split(",")
															.slice(0, 3)
															.map((tag, tagIndex) => (
																<Chip key={tagIndex} label={tag.trim()} size="small" variant="outlined" />
															))}
														{row.tags.split(",").length > 3 && (
															<Chip label={`+${row.tags.split(",").length - 3}`} size="small" variant="outlined" />
														)}
													</Stack>
												</Stack>
											</TableCell>
											<TableCell>
												<Chip
													color={getCategoryColor(row.category) as any}
													label={row.category.toUpperCase()}
													size="small"
												/>
											</TableCell>
											<TableCell>
												<Stack spacing={1}>
													<Switch
														checked={row.isPublished}
														onChange={(event) => handleTogglePublished(row.id, event.target.checked)}
														size="small"
													/>
													<Typography variant="caption" color="text.secondary">
														{row.isPublished ? "Published" : "Draft"}
													</Typography>
												</Stack>
											</TableCell>
											<TableCell>
												<Stack spacing={0.5}>
													<Typography variant="body2">{row.views} views</Typography>
													<Typography variant="body2" color="text.secondary">
														{row.helpful} helpful
													</Typography>
												</Stack>
											</TableCell>
											<TableCell>
												<Typography variant="body2">{row.updatedAt.toLocaleDateString()}</Typography>
											</TableCell>
											<TableCell>
												<Stack direction="row" spacing={0.5}>
													<IconButton size="small" title="View Article" onClick={() => console.log("View:", row.id)}>
														<EyeIcon />
													</IconButton>
													<IconButton size="small" title="Edit Article" onClick={() => handleEdit(row)}>
														<EditIcon />
													</IconButton>
													<IconButton
														size="small"
														title="Delete Article"
														onClick={() => handleDelete(row.id)}
														color="error"
													>
														<DeleteIcon />
													</IconButton>
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
						page={page}
						rowsPerPage={rowsPerPage}
						rowsPerPageOptions={[5, 10, 25]}
						onPageChange={noop}
						onRowsPerPageChange={noop}
					/>
				</Card>

				<HelpArticleFormDialog
					open={formDialogOpen}
					onClose={() => {
						setFormDialogOpen(false);
						setEditingArticle(null);
					}}
					article={editingArticle}
					onSubmit={handleFormSubmit}
				/>
			</>
		);
	}
);
