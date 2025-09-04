"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { toast } from "react-hot-toast";

import { paths } from "@/paths";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";

export default function ChecklistsPage(): React.JSX.Element {
	const { user } = useUser();
	const router = useRouter();

	// Access guard: only role 3 users
	React.useEffect(() => {
		if (user && user.roles !== 3) {
			// Non-users are redirected to dashboard
			router.push(paths.dashboard.overview);
		}
	}, [user, router]);

	const [lists, setLists] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchLists = React.useCallback(async () => {
		try {
			setLoading(true);
			const res = await apiClient.getChecklists();
			if (res.success) setLists(res.data || []);
			else setError(res.error || "Failed to load checklists");
		} catch (e) {
			setError("Failed to load checklists");
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchLists();
	}, [fetchLists]);

	// Dialog states
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [editId, setEditId] = React.useState<string | null>(null);
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");

	const openCreate = () => {
		setEditId(null);
		setTitle("");
		setDescription("");
		setDialogOpen(true);
	};
	const openEdit = (list: any) => {
		setEditId(list.id.toString());
		setTitle(list.title);
		setDescription(list.description || "");
		setDialogOpen(true);
	};

	const saveChecklist = async () => {
		try {
			const payload = { title, description };
			const res = editId ? await apiClient.updateChecklist(editId, payload) : await apiClient.createChecklist(payload);
			if (res.success) {
				toast.success(editId ? "Checklist updated" : "Checklist created");
				setDialogOpen(false);
				fetchLists();
			} else toast.error(res.error || "Save failed");
		} catch (e) {
			toast.error("Save failed");
		}
	};

	const toggleComplete = async (list: any) => {
		try {
			const res = await apiClient.updateChecklist(list.id.toString(), { isCompleted: !list.isCompleted });
			if (res.success) fetchLists();
		} catch {}
	};

	const deleteChecklist = async (id: string) => {
		try {
			const res = await apiClient.deleteChecklist(id);
			if (res.success) {
				toast.success("Checklist deleted");
				fetchLists();
			}
		} catch {}
	};

	return (
		<Stack spacing={3}>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography variant="h4">My Scam Prevention Checklists</Typography>
				<Button startIcon={<PlusIcon />} variant="contained" onClick={openCreate}>
					New Checklist
				</Button>
			</Stack>

			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "800px" }}>
						<TableHead>
							<TableRow>
								<TableCell>Done</TableCell>
								<TableCell>Title</TableCell>
								<TableCell>Description</TableCell>
								<TableCell>Items</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{lists.map((list) => (
								<TableRow key={list.id}>
									<TableCell width={80}>
										<Checkbox checked={list.isCompleted} onChange={() => toggleComplete(list)} />
									</TableCell>
									<TableCell width={260}>
										<Typography variant="subtitle2">{list.title}</Typography>
									</TableCell>
									<TableCell>{list.description}</TableCell>
									<TableCell>{list.items?.length || 0}</TableCell>
									<TableCell width={180}>
										<Stack direction="row" spacing={1}>
											<IconButton title="Edit" onClick={() => openEdit(list)}>
												<EditIcon />
											</IconButton>
											<IconButton color="error" title="Delete" onClick={() => deleteChecklist(list.id.toString())}>
												<TrashIcon />
											</IconButton>
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Box>
				<Divider />
			</Card>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{editId ? "Edit Checklist" : "New Checklist"}</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
						<TextField
							label="Description (optional)"
							fullWidth
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={saveChecklist} disabled={!title.trim()}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}




