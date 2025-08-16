import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { paths } from "@/paths";
import { DynamicLogo } from "@/components/core/logo";

export interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<Box
			sx={{
				display: { xs: "flex", lg: "grid" },
				flexDirection: "column",
				gridTemplateColumns: "1fr 1fr",
				minHeight: "100%",
			}}
		>
			<Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column" }}>
				<Box sx={{ p: 3 }}>
					<Box component={RouterLink} href={paths.home} sx={{ display: "inline-block", fontSize: 0 }}>
						<DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
					</Box>
				</Box>
				<Box sx={{ alignItems: "center", display: "flex", flex: "1 1 auto", justifyContent: "center", p: 3 }}>
					<Box sx={{ maxWidth: "450px", width: "100%" }}>{children}</Box>
				</Box>
			</Box>
			<Box
				sx={{
					alignItems: "center",
					background: "radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)",
					color: "var(--mui-palette-common-white)",
					display: { xs: "none", lg: "flex" },
					justifyContent: "center",
					p: 3,
				}}
			>
				<Stack spacing={3}>
					<Stack spacing={1}>
						<Typography color="inherit" sx={{ fontSize: "24px", lineHeight: "32px", textAlign: "center" }} variant="h1">
							Welcome to{" "}
							<Box component="span" sx={{ color: "#15b79e" }}>
								Devias Kit
							</Box>
						</Typography>
						<Typography align="center" variant="subtitle1">
							Your gateway to a powerful and intuitive dashboard experience.
						</Typography>
					</Stack>
					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Box
							sx={{
								width: "100%",
								maxWidth: "480px",
								height: "360px",
								position: "relative",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{/* Main Dashboard Mockup */}
							<Box
								sx={{
									width: "100%",
									height: "280px",
									background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
									borderRadius: "20px",
									boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
									border: "1px solid rgba(255,255,255,0.2)",
									position: "relative",
									overflow: "hidden",
								}}
							>
								{/* Header Bar */}
								<Box
									sx={{
										height: "60px",
										background: "linear-gradient(90deg, #15b79e 0%, #0891b2 100%)",
										display: "flex",
										alignItems: "center",
										px: 3,
										gap: 2,
									}}
								>
									<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ff5f57" }} />
									<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ffbd2e" }} />
									<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#28ca42" }} />
									<Typography sx={{ color: "white", fontSize: "14px", fontWeight: 600, ml: 2 }}>Dashboard</Typography>
								</Box>

								{/* Content Area */}
								<Box sx={{ p: 3, height: "calc(100% - 60px)" }}>
									{/* Stats Cards */}
									<Box sx={{ display: "flex", gap: 2, mb: 3 }}>
										{[1, 2, 3].map((i) => (
											<Box
												key={i}
												sx={{
													flex: 1,
													height: "80px",
													background: `linear-gradient(135deg, ${
														i === 1 ? "#667eea" : i === 2 ? "#f093fb" : "#4facfe"
													} 0%, ${i === 1 ? "#764ba2" : i === 2 ? "#f093fb" : "#00f2fe"} 100%)`,
													borderRadius: "12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: "white",
													fontSize: "24px",
													fontWeight: "bold",
												}}
											>
												{i === 1 ? "📊" : i === 2 ? "👥" : "💰"}
											</Box>
										))}
									</Box>

									{/* Chart Area */}
									<Box
										sx={{
											height: "100px",
											background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
											borderRadius: "12px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											position: "relative",
											overflow: "hidden",
										}}
									>
										{/* Simulated Chart Lines */}
										<svg width="100%" height="60" style={{ position: "absolute" }}>
											<path
												d="M 20 40 Q 60 20 100 30 T 180 25 T 260 35"
												stroke="#15b79e"
												strokeWidth="3"
												fill="none"
												strokeLinecap="round"
											/>
											<path
												d="M 20 50 Q 60 35 100 40 T 180 30 T 260 45"
												stroke="#667eea"
												strokeWidth="3"
												fill="none"
												strokeLinecap="round"
											/>
										</svg>
										<Typography sx={{ color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
											Analytics Overview
										</Typography>
									</Box>
								</Box>
							</Box>

							{/* Floating Elements */}
							<Box
								sx={{
									position: "absolute",
									top: -10,
									right: -10,
									width: 60,
									height: 60,
									background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
									fontSize: "24px",
								}}
							>
								⚡
							</Box>

							<Box
								sx={{
									position: "absolute",
									bottom: -15,
									left: -15,
									width: 50,
									height: 50,
									background: "linear-gradient(135deg, #15b79e 0%, #0891b2 100%)",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: "0 10px 25px rgba(21, 183, 158, 0.3)",
									fontSize: "20px",
								}}
							>
								🎯
							</Box>
						</Box>
					</Box>
				</Stack>
			</Box>
		</Box>
	);
}
