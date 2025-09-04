"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { UserFAQTable } from "@/components/dashboard/help/user-faq-table";

export default function UserFAQPage(): React.JSX.Element {
	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Help & FAQ</Typography>
				<Typography color="text.secondary" variant="body1">
					Browse help articles, FAQs, and tutorials
				</Typography>
			</Stack>
			<UserFAQTable />
		</Stack>
	);
}




