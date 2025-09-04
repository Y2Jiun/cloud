"use client";

import * as React from "react";
import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "@/paths";
import { useUser } from "@/hooks/use-user";

function HomePage(): React.JSX.Element {
	const { user, isLoading } = useUser();

	// Always redirect to sign-in page when system starts
	React.useEffect(() => {
		if (!isLoading) {
			if (user) {
				// If user is logged in, redirect to dashboard
				redirect(paths.dashboard.overview);
			} else {
				// If user is not logged in, redirect to sign-in
				redirect(paths.auth.signIn);
			}
		}
	}, [user, isLoading]);

	// Show loading while redirecting
	return (
		<Container maxWidth="lg" sx={{ py: 8 }}>
			<Typography variant="h4" align="center">
				Redirecting to sign-in...
			</Typography>
		</Container>
	);
}

export default HomePage;
