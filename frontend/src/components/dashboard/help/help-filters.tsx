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

export function HelpFilters(): React.JSX.Element {
	const [searchTerm, setSearchTerm] = React.useState("");
	const [categoryFilter, setCategoryFilter] = React.useState("all");
	const [statusFilter, setStatusFilter] = React.useState("all");
	const [sortBy, setSortBy] = React.useState("updated");

	return (
		<Card sx={{ p: 2 }}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-end" }}>
				{/* Search */}
				<FormControl sx={{ minWidth: 240 }}>
					<OutlinedInput
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search articles..."
						startAdornment={
							<InputAdornment position="start">
								<SearchIcon fontSize="var(--icon-fontSize-md)" />
							</InputAdornment>
						}
					/>
				</FormControl>

				{/* Category Filter */}
				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel>Category</InputLabel>
					<Select
						value={categoryFilter}
						label="Category"
						onChange={(e) => setCategoryFilter(e.target.value)}
					>
						<MenuItem value="all">All Categories</MenuItem>
						<MenuItem value="faq">FAQ</MenuItem>
						<MenuItem value="guide">Guide</MenuItem>
						<MenuItem value="tutorial">Tutorial</MenuItem>
						<MenuItem value="policy">Policy</MenuItem>
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
						<MenuItem value="published">Published</MenuItem>
						<MenuItem value="draft">Draft</MenuItem>
						<MenuItem value="pinned">Pinned</MenuItem>
					</Select>
				</FormControl>

				{/* Sort By */}
				<FormControl sx={{ minWidth: 140 }}>
					<InputLabel>Sort By</InputLabel>
					<Select
						value={sortBy}
						label="Sort By"
						onChange={(e) => setSortBy(e.target.value)}
					>
						<MenuItem value="updated">Last Updated</MenuItem>
						<MenuItem value="created">Date Created</MenuItem>
						<MenuItem value="title">Title A-Z</MenuItem>
						<MenuItem value="views">Most Viewed</MenuItem>
						<MenuItem value="helpful">Most Helpful</MenuItem>
						<MenuItem value="order">Display Order</MenuItem>
					</Select>
				</FormControl>
			</Stack>
		</Card>
	);
}
