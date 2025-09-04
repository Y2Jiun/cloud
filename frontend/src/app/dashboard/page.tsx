"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
	CheckCircleIcon,
	CheckSquareIcon,
	ClockIcon,
	CurrencyDollarIcon,
	FileTextIcon,
	GavelIcon,
	ListBulletsIcon,
	QuestionIcon,
	ReceiptIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";
import { Sales } from "@/components/dashboard/overview/sales";

// Custom components that accept title props
function CustomBudget({
	title,
	value,
	icon,
	color = "primary",
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	color?: string;
}) {
	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
					<Stack spacing={1}>
						<Typography color="text.secondary" variant="overline">
							{title}
						</Typography>
						<Typography variant="h4">{value}</Typography>
					</Stack>
					<Avatar sx={{ backgroundColor: `var(--mui-palette-${color}-main)`, height: "56px", width: "56px" }}>
						{icon}
					</Avatar>
				</Stack>
			</CardContent>
		</Card>
	);
}

function CustomTotalProfit({
	title,
	value,
	icon,
	color = "primary",
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	color?: string;
}) {
	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
					<Stack spacing={1}>
						<Typography color="text.secondary" variant="overline">
							{title}
						</Typography>
						<Typography variant="h4">{value}</Typography>
					</Stack>
					<Avatar sx={{ backgroundColor: `var(--mui-palette-${color}-main)`, height: "56px", width: "56px" }}>
						{icon}
					</Avatar>
				</Stack>
			</CardContent>
		</Card>
	);
}

function CustomTasksProgress({
	title,
	value,
	icon,
	color = "warning",
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
	color?: string;
}) {
	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Stack spacing={2}>
					<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
						<Stack spacing={1}>
							<Typography color="text.secondary" gutterBottom variant="overline">
								{title}
							</Typography>
							<Typography variant="h4">{value}%</Typography>
						</Stack>
						<Avatar sx={{ backgroundColor: `var(--mui-palette-${color}-main)`, height: "56px", width: "56px" }}>
							{icon}
						</Avatar>
					</Stack>
					<div>
						<LinearProgress value={value} variant="determinate" />
					</div>
				</Stack>
			</CardContent>
		</Card>
	);
}

function Tile({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Box>
			<Typography color="text.secondary" variant="overline" sx={{ mb: 1, display: "block" }}>
				{title}
			</Typography>
			{children}
		</Box>
	);
}

const getRoleName = (roleNumber?: number): string => {
	switch (roleNumber) {
		case 1:
			return "Admin";
		case 2:
			return "Legal Officer";
		case 3:
			return "User";
		default:
			return "User";
	}
};

export default function Page(): React.JSX.Element {
	const { user } = useUser();
	const [stats, setStats] = React.useState<any>(null);
	const [loading, setLoading] = React.useState(true);
	const [series, setSeries] = React.useState<{
		title: string;
		labels: string[];
		series: { name: string; data: number[] }[];
	} | null>(null);

	React.useEffect(() => {
		(async () => {
			const [statsRes, seriesRes] = await Promise.all([
				apiClient.getDashboardStatsTruth(),
				apiClient.getDashboardSeries(),
			]);
			if (statsRes.success) setStats(statsRes.data);
			if (seriesRes.success) setSeries(seriesRes.data);
			setLoading(false);
		})();
	}, []);

	const getWelcomeMessage = () => {
		if (!user?.username) return "Welcome back! 👋";
		const roleName = getRoleName(user.roles);
		return `Welcome ${roleName}, ${user.username}! 👋`;
	};

	const role = user?.roles;

	const renderTiles = () => {
		if (!stats) return null;

		if (role === 1) {
			// Admin tiles
			return (
				<>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomBudget
							title="Total Users"
							value={loading ? "-" : String(stats?.totalUsers ?? "-")}
							icon={<UsersIcon />}
							color="primary"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="Total FAQs"
							value={loading ? "-" : String(stats?.totalFAQs ?? "-")}
							icon={<QuestionIcon />}
							color="secondary"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Reports"
							value={loading ? 0 : (stats?.scamReports?.pending ?? 0)}
							icon={<FileTextIcon />}
							color="warning"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Alerts"
							value={loading ? 0 : (stats?.scamAlerts?.pending ?? 0)}
							icon={<QuestionIcon />}
							color="error"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Legal Cases"
							value={loading ? 0 : (stats?.legalCases?.pending ?? 0)}
							icon={<GavelIcon />}
							color="info"
						/>
					</Grid>
				</>
			);
		} else if (role === 2) {
			// Legal Officer tiles
			return (
				<>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="My Alerts"
							value={loading ? "-" : String(stats?.myScamAlerts?.total ?? "-")}
							icon={<QuestionIcon />}
							color="primary"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="My Legal Cases"
							value={loading ? "-" : String(stats?.myLegalCases?.total ?? "-")}
							icon={<GavelIcon />}
							color="secondary"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Alerts"
							value={loading ? 0 : (stats?.myScamAlerts?.pending ?? 0)}
							icon={<ClockIcon />}
							color="warning"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Cases"
							value={loading ? 0 : (stats?.myLegalCases?.pending ?? 0)}
							icon={<ClockIcon />}
							color="info"
						/>
					</Grid>
				</>
			);
		} else {
			// User tiles
			return (
				<>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="My Reports"
							value={loading ? "-" : String(stats?.myScamReports?.total ?? "-")}
							icon={<FileTextIcon />}
							color="primary"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTasksProgress
							title="Pending Reports"
							value={loading ? 0 : (stats?.myScamReports?.pending ?? 0)}
							icon={<ClockIcon />}
							color="warning"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="Approved Alerts"
							value={loading ? "-" : String(stats?.approvedContent?.alerts ?? "-")}
							icon={<CheckCircleIcon />}
							color="success"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="Approved Cases"
							value={loading ? "-" : String(stats?.approvedContent?.cases ?? "-")}
							icon={<GavelIcon />}
							color="info"
						/>
					</Grid>
					<Grid size={{ lg: 3, sm: 6, xs: 12 }}>
						<CustomTotalProfit
							title="My Checklists"
							value={loading ? "-" : String(stats?.myChecklists ?? "-")}
							icon={<CheckSquareIcon />}
							color="secondary"
						/>
					</Grid>
				</>
			);
		}
	};

	// Generate sample chart data for the chart visualization
	const getChartData = () => {
		// Always use sample data for the chart to make it interactive and interesting
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		if (role === 1) {
			// Admin: Show system-wide trends and growth patterns
			return {
				labels: months,
				title: "System Growth & Activity Trends (Last 12 months)",
				series: [
					{
						name: "New Users",
						data: [25, 32, 28, 45, 52, 48, 58, 65, 62, 70, 75, 82],
					},
					{
						name: "Scam Reports",
						data: [18, 25, 22, 35, 42, 38, 48, 55, 52, 60, 65, 72],
					},
					{
						name: "Legal Cases",
						data: [8, 12, 10, 18, 22, 20, 28, 32, 30, 38, 42, 45],
					},
				],
			};
		} else if (role === 2) {
			// Legal Officer: Show personal productivity and case management
			return {
				labels: months,
				title: "My Productivity & Case Management (Last 12 months)",
				series: [
					{
						name: "Scam Alerts Created",
						data: [3, 5, 4, 7, 6, 8, 7, 10, 9, 12, 11, 14],
					},
					{
						name: "Legal Cases Handled",
						data: [2, 4, 3, 6, 5, 7, 6, 9, 8, 11, 10, 13],
					},
					{
						name: "Documents Processed",
						data: [5, 8, 7, 12, 10, 15, 13, 18, 16, 22, 20, 25],
					},
				],
			};
		} else {
			// User: Show personal engagement and learning progress
			return {
				labels: months,
				title: "My Learning & Engagement Progress (Last 12 months)",
				series: [
					{
						name: "Scam Reports Submitted",
						data: [1, 0, 2, 1, 0, 1, 2, 1, 0, 1, 1, 2],
					},
					{
						name: "Security Checklists Completed",
						data: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8],
					},
					{
						name: "Educational Content Viewed",
						data: [8, 12, 10, 15, 13, 18, 16, 22, 20, 25, 23, 28],
					},
				],
			};
		}
	};

	// Generate pie chart data for current month summary
	const getPieChartData = () => {
		if (role === 1) {
			// Admin: Current month system summary
			return {
				title: "Current Month System Overview",
				series: [82, 72, 45], // Users, Reports, Cases
				labels: ["New Users", "Scam Reports", "Legal Cases"],
			};
		} else if (role === 2) {
			// Legal Officer: Current month personal summary
			return {
				title: "Current Month My Activity",
				series: [14, 13, 25], // Alerts, Cases, Documents
				labels: ["Alerts Created", "Cases Handled", "Documents Processed"],
			};
		} else {
			// User: Current month personal summary
			return {
				title: "Current Month My Progress",
				series: [2, 8, 28], // Reports, Checklists, Content
				labels: ["Reports Submitted", "Checklists Completed", "Content Viewed"],
			};
		}
	};

	const chartData = getChartData();
	const pieChartData = getPieChartData();

	return (
		<Box>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					{getWelcomeMessage()}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					A comprehensive platform for scam prevention, legal case management, and user protection services.
				</Typography>
			</Box>

			<Grid container spacing={3}>
				{renderTiles()}
			</Grid>

			{/* Charts Section */}
			<Grid container spacing={3} sx={{ mt: 3 }}>
				{/* Bar Chart */}
				<Grid size={{ lg: 8, xs: 12 }}>
					<Sales
						chartType="bar"
						chartSeries={chartData?.series || []}
						labels={chartData?.labels || []}
						title={chartData?.title || "Activity"}
						sx={{ height: "100%" }}
					/>
				</Grid>
				{/* Pie Chart */}
				<Grid size={{ lg: 4, xs: 12 }}>
					<Sales
						chartType="pie"
						chartSeries={pieChartData?.series || []}
						labels={pieChartData?.labels || []}
						title={pieChartData?.title || "Summary"}
						sx={{ height: "100%" }}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
