"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { Preferences } from "@/components/dashboard/settings/preferences";

export default function Page(): React.JSX.Element {
	const { t } = useTranslation();

	return (
		<Stack spacing={3}>
			<div>
				<Typography variant="h4">{t("settings.title")}</Typography>
			</div>
			<Preferences />
		</Stack>
	);
}
