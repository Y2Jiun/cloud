"use client";

import * as React from "react";
import type { Metadata } from "next";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { config } from "@/config";
import { AccountDetailsForm } from "@/components/dashboard/account/account-details-form";
import { AccountInfo } from "@/components/dashboard/account/account-info";

// export const metadata = { title: `Account | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
	const [selectedImage, setSelectedImage] = React.useState<File | undefined>();
	const [previewImageUrl, setPreviewImageUrl] = React.useState<string | undefined>();
	const [refreshKey, setRefreshKey] = React.useState(0);

	const handleImageSelect = (file: File) => {
		setSelectedImage(file);
		// Create preview URL
		const url = URL.createObjectURL(file);
		setPreviewImageUrl(url);
	};

	const handleImageSaved = () => {
		// Clear the selected image and preview after successful save
		setSelectedImage(undefined);
		if (previewImageUrl) {
			URL.revokeObjectURL(previewImageUrl);
		}
		setPreviewImageUrl(undefined);
		// Force re-render of components
		setRefreshKey((prev) => prev + 1);
	};

	// Cleanup preview URL when component unmounts
	React.useEffect(() => {
		return () => {
			if (previewImageUrl) {
				URL.revokeObjectURL(previewImageUrl);
			}
		};
	}, [previewImageUrl]);

	return (
		<Stack spacing={3}>
			<div>
				<Typography variant="h4">Account</Typography>
			</div>
			<Grid container spacing={3}>
				<Grid
					size={{
						lg: 4,
						md: 6,
						xs: 12,
					}}
				>
					<AccountInfo
						key={`account-info-${refreshKey}`}
						onImageSelect={handleImageSelect}
						previewImage={previewImageUrl}
					/>
				</Grid>
				<Grid
					size={{
						lg: 8,
						md: 6,
						xs: 12,
					}}
				>
					<AccountDetailsForm
						selectedImage={selectedImage}
						previewImageUrl={previewImageUrl}
						onImageSaved={handleImageSaved}
					/>
				</Grid>
			</Grid>
		</Stack>
	);
}
