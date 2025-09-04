"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

interface UsersFiltersProps {
	search?: string;
	onSearchChange?: (search: string) => void;
}

export function UsersFilters({ search, onSearchChange }: UsersFiltersProps): React.JSX.Element {
	return (
		<Card sx={{ p: 2 }}>
			<Stack direction="row" spacing={2} alignItems="center">
				<Box sx={{ flex: "1 1 auto" }}>
					<TextField
						fullWidth
						placeholder="Search users by username or email..."
						value={search || ""}
						onChange={(event) => onSearchChange?.(event.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
								</InputAdornment>
							),
						}}
					/>
				</Box>
			</Stack>
		</Card>
	);
}
