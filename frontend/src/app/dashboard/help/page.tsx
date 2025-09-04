"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { paths } from "@/paths";
import { useUser } from "@/hooks/use-user";
import { HelpArticlesTable } from "@/components/dashboard/help/help-articles-table";
import { HelpFilters } from "@/components/dashboard/help/help-filters";

export default function Page(): React.JSX.Element {
	const tableRef = React.useRef<{ openCreateDialog: () => void }>(null);
	const { user } = useUser();

	// Handle redirect for non-admin users - useEffect must be called unconditionally
	React.useEffect(() => {
		if (user?.roles !== 1) {
			window.location.href = paths.dashboard.faqs;
		}
	}, [user?.roles]);

	const handleCreateArticle = () => {
		tableRef.current?.openCreateDialog();
	};

	// Check if user is admin
	if (user?.roles !== 1) {
		return (
			<Stack spacing={3}>
				<Alert severity="info">Redirecting you to the user FAQ page...</Alert>
			</Stack>
		);
	}

	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }}>
					<Typography variant="h4">Help & FAQ Management</Typography>
					<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
						<Typography color="text.secondary" variant="body1">
							Manage help articles, FAQs, and user guides
						</Typography>
					</Stack>
				</Stack>
				<div>
					<Button
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						onClick={handleCreateArticle}
					>
						Create Article
					</Button>
				</div>
			</Stack>
			<HelpFilters />
			<HelpArticlesTable ref={tableRef} />
		</Stack>
	);
}
