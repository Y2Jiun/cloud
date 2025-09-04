"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/components/core/chart";

export interface SalesProps {
	chartSeries: { name: string; data: number[] }[];
	labels?: string[];
	title?: string;
	chartType?: "bar" | "pie";
	sx?: SxProps;
}

export function Sales({
	chartSeries,
	labels,
	title = "Activity",
	chartType = "bar",
	sx,
}: SalesProps): React.JSX.Element {
	const chartOptions = useChartOptions(labels, chartType);

	return (
		<Card sx={sx}>
			<CardHeader
				action={
					<Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
						Sync
					</Button>
				}
				title={title}
			/>
			<CardContent>
				<Chart
					height={350}
					options={chartOptions}
					series={chartType === "pie" ? (Array.isArray(chartSeries) ? chartSeries : []) : chartSeries}
					type={chartType}
					width="100%"
				/>
			</CardContent>
			<Divider />
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small">
					Overview
				</Button>
			</CardActions>
		</Card>
	);
}

function useChartOptions(customLabels?: string[], chartType: "bar" | "pie" = "bar"): ApexOptions {
	const theme = useTheme();

	if (chartType === "pie") {
		return {
			chart: {
				background: "transparent",
				toolbar: { show: false },
				animations: {
					enabled: true,
					easing: "easeinout",
					speed: 1500,
					animateGradually: {
						enabled: true,
						delay: 100,
					},
					dynamicAnimation: {
						enabled: true,
						speed: 600,
					},
				},
				dropShadow: {
					enabled: true,
					top: 3,
					left: 3,
					blur: 8,
					opacity: 0.15,
				},
			},
			colors: [
				"#3b82f6", // Beautiful blue
				"#ec4899", // Vibrant pink
				"#10b981", // Rich green
				"#f59e0b", // Warm orange
				"#ef4444", // Bright red
				"#8b5cf6", // Deep purple
			],
			dataLabels: {
				enabled: false,
			},
			labels: customLabels || [],
			legend: {
				show: true,
				position: "bottom",
				horizontalAlign: "center",
				fontSize: "13px",
				fontWeight: "600",
				markers: {
					width: 16,
					height: 16,
					radius: 8,
				},
			},
			plotOptions: {
				pie: {
					donut: {
						size: "0%",
						labels: {
							show: false,
						},
					},
					expandOnClick: true,
					customScale: 1,
					offsetY: 0,
					startAngle: 0,
					endAngle: 360,
					center: ["50%", "50%"],
					distributed: false,
					dataLabels: {
						enabled: false,
						offset: 0,
						minAngleToShowLabel: 0,
					},
					labels: {
						show: false,
					},
				},
			},
			stroke: {
				colors: ["#fff"],
				width: 3,
			},
			theme: { mode: theme.palette.mode },
			tooltip: {
				enabled: true,
				theme: theme.palette.mode,
				style: {
					fontSize: "14px",
					fontWeight: "500",
				},
				y: {
					formatter: (value) => `${Math.round(value)} items`,
				},
				marker: {
					show: true,
				},
			},
		};
	}

	// Bar chart options - completely redesigned for beauty
	return {
		chart: {
			background: "transparent",
			stacked: false,
			toolbar: { show: false },
			animations: {
				enabled: true,
				easing: "easeinout",
				speed: 1500,
				animateGradually: {
					enabled: true,
					delay: 100,
				},
				dynamicAnimation: {
					enabled: true,
					speed: 600,
				},
			},
			dropShadow: {
				enabled: true,
				top: 3,
				left: 3,
				blur: 8,
				opacity: 0.15,
			},
		},
		colors: [
			"#3b82f6", // Beautiful blue
			"#ec4899", // Vibrant pink
			"#10b981", // Rich green
			"#f59e0b", // Warm orange
			"#ef4444", // Bright red
			"#8b5cf6", // Deep purple
		],
		dataLabels: {
			enabled: false,
		},
		fill: {
			opacity: 1,
			type: "solid",
		},
		grid: {
			borderColor: "transparent",
			strokeDashArray: 0,
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: false } },
			padding: {
				top: 20,
				right: 20,
				bottom: 20,
				left: 20,
			},
		},
		legend: {
			show: true,
			position: "bottom",
			horizontalAlign: "center",
			fontSize: "14px",
			fontWeight: "600",
			markers: {
				width: 16,
				height: 16,
				radius: 8,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: "55%",
				endingShape: "rounded",
				dataLabels: {
					position: "top",
					enabled: false,
				},
			},
		},
		stroke: {
			colors: ["transparent"],
			show: true,
			width: 0,
		},
		theme: { mode: theme.palette.mode },
		xaxis: {
			axisBorder: {
				color: "transparent",
				show: false,
			},
			axisTicks: {
				color: "transparent",
				show: false,
			},
			categories:
				customLabels && customLabels.length > 0
					? customLabels
					: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			labels: {
				offsetY: 8,
				style: {
					colors: theme.palette.text.secondary,
					fontSize: "12px",
					fontWeight: "500",
				},
			},
		},
		yaxis: {
			labels: {
				formatter: (value) => `${Math.round(value)}`,
				offsetX: -15,
				style: {
					colors: theme.palette.text.secondary,
					fontSize: "12px",
					fontWeight: "500",
				},
			},
			grid: {
				show: false,
			},
		},
		tooltip: {
			enabled: true,
			theme: theme.palette.mode,
			style: {
				fontSize: "14px",
				fontWeight: "500",
			},
			y: {
				formatter: (value) => `${value} items`,
			},
			shared: true,
			intersect: false,
			marker: {
				show: true,
			},
		},
		states: {
			hover: {
				filter: {
					type: "darken",
					value: 0.1,
				},
			},
			active: {
				filter: {
					type: "darken",
					value: 0.2,
				},
			},
		},
	};
}
