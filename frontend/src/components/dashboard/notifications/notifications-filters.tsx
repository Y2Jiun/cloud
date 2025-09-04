"use client";

import * as React from "react";
import {
	Card,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
} from "@mui/material";
import { MagnifyingGlass as SearchIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

export function NotificationsFilters(): React.JSX.Element {
	const [searchTerm, setSearchTerm] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState("all");
	const [statusFilter, setStatusFilter] = React.useState("all");
	const [audienceFilter, setAudienceFilter] = React.useState("all");

	return (
		<Card sx={{ p: 2 }}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-end" }}>
				{/* Search */}
				<FormControl sx={{ minWidth: 240 }}>
					<OutlinedInput
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search notifications..."
						startAdornment={
							<InputAdornment position="start">
								<SearchIcon fontSize="var(--icon-fontSize-md)" />
							</InputAdornment>
						}
					/>
				</FormControl>

				{/* Type Filter */}
				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel>Type</InputLabel>
					<Select
						value={typeFilter}
						label="Type"
						onChange={(e) => setTypeFilter(e.target.value)}
					>
						<MenuItem value="all">All Types</MenuItem>
						<MenuItem value="info">Info</MenuItem>
						<MenuItem value="success">Success</MenuItem>
						<MenuItem value="warning">Warning</MenuItem>
						<MenuItem value="error">Error</MenuItem>
					</Select>
				</FormControl>

				{/* Status Filter */}
				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={statusFilter}
						label="Status"
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<MenuItem value="all">All Status</MenuItem>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="inactive">Inactive</MenuItem>
						<MenuItem value="expired">Expired</MenuItem>
					</Select>
				</FormControl>

				{/* Audience Filter */}
				<FormControl sx={{ minWidth: 140 }}>
					<InputLabel>Audience</InputLabel>
					<Select
						value={audienceFilter}
						label="Audience"
						onChange={(e) => setAudienceFilter(e.target.value)}
					>
						<MenuItem value="all">All Audiences</MenuItem>
						<MenuItem value="users">Users Only</MenuItem>
						<MenuItem value="admins">Admins Only</MenuItem>
					</Select>
				</FormControl>
			</Stack>
		</Card>
	);
}
