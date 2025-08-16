"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { GlobeIcon } from "@phosphor-icons/react/dist/ssr/Globe";
import { PaletteIcon } from "@phosphor-icons/react/dist/ssr/Palette";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { TextAaIcon } from "@phosphor-icons/react/dist/ssr/TextAa";
import { useTranslation } from "react-i18next";

import { useSettings } from "@/contexts/settings-context";

export function Preferences(): React.JSX.Element {
	const { settings, updateSettings, resetSettings } = useSettings();
	const { t } = useTranslation();
	const [saveMessage, setSaveMessage] = React.useState<string>("");

	console.log("Current settings:", settings);

	const handlePreferenceChange = (category: string, key: string, value: any) => {
		console.log("handlePreferenceChange called:", { category, key, value });
		if (category === "notifications" || category === "privacy") {
			updateSettings({
				[category]: {
					...settings[category],
					[key]: value,
				},
			});
		} else {
			updateSettings({ [category]: value });
		}
	};

	const handleSave = () => {
		setSaveMessage(t("messages.settingsSaved"));
		setTimeout(() => setSaveMessage(""), 3000);
	};

	const handleReset = () => {
		resetSettings();
		setSaveMessage(t("messages.settingsReset"));
		setTimeout(() => setSaveMessage(""), 3000);
	};

	return (
		<Stack spacing={3}>
			{/* Appearance Settings */}
			<Card>
				<CardHeader
					avatar={<PaletteIcon fontSize="var(--icon-fontSize-lg)" />}
					title={t("settings.appearance")}
					subheader={t("settings.appearance.subtitle")}
				/>
				<Divider />
				<CardContent>
					<Grid container spacing={4}>
						<Grid size={{ md: 6, xs: 12 }}>
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" gutterBottom>
										{t("settings.theme")}
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<Typography variant="body2">{t("settings.theme.light")}</Typography>
										<Switch
											checked={settings.darkMode}
											onChange={(e) => {
												console.log(
													"Switch clicked! Current value:",
													settings.darkMode,
													"New value:",
													e.target.checked
												);
												handlePreferenceChange("darkMode", "", e.target.checked);
											}}
										/>
										<Typography variant="body2">{t("settings.theme.dark")}</Typography>
									</Box>
								</Box>

								<Box>
									<Typography variant="h6" gutterBottom>
										{t("settings.compactMode")}
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<Typography variant="body2">{t("settings.compactMode.spacious")}</Typography>
										<Switch
											checked={settings.compactMode}
											onChange={(e) => handlePreferenceChange("compactMode", "", e.target.checked)}
										/>
										<Typography variant="body2">{t("settings.compactMode.compact")}</Typography>
									</Box>
								</Box>
							</Stack>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" gutterBottom>
										{t("settings.fontSize")}
									</Typography>
									<Box sx={{ px: 2 }}>
										<Slider
											value={settings.fontSize}
											onChange={(e, value) => handlePreferenceChange("fontSize", "", value)}
											min={12}
											max={24}
											step={1}
											marks={[
												{ value: 12, label: "12px" },
												{ value: 16, label: "16px" },
												{ value: 20, label: "20px" },
												{ value: 24, label: "24px" },
											]}
											valueLabelDisplay="auto"
										/>
									</Box>
								</Box>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Notification Settings */}
			<Card>
				<CardHeader
					avatar={<BellIcon fontSize="var(--icon-fontSize-lg)" />}
					title={t("settings.notifications")}
					subheader={t("settings.notifications.subtitle")}
				/>
				<Divider />
				<CardContent>
					<Grid container spacing={4}>
						<Grid size={{ md: 6, xs: 12 }}>
							<Typography variant="h6" gutterBottom>
								{t("settings.notifications.email")}
							</Typography>
							<FormGroup>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.notifications.email}
											onChange={(e) => handlePreferenceChange("notifications", "email", e.target.checked)}
										/>
									}
									label={t("settings.notifications.productUpdates")}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.notifications.security}
											onChange={(e) => handlePreferenceChange("notifications", "security", e.target.checked)}
										/>
									}
									label={t("settings.notifications.securityAlerts")}
								/>
							</FormGroup>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<Typography variant="h6" gutterBottom>
								{t("settings.notifications.push")}
							</Typography>
							<FormGroup>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.notifications.push}
											onChange={(e) => handlePreferenceChange("notifications", "push", e.target.checked)}
										/>
									}
									label={t("settings.notifications.browserNotifications")}
								/>
							</FormGroup>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Language & Region */}
			<Card>
				<CardHeader
					avatar={<GlobeIcon fontSize="var(--icon-fontSize-lg)" />}
					title={t("settings.language")}
					subheader={t("settings.language.subtitle")}
				/>
				<Divider />
				<CardContent>
					<Grid container spacing={4}>
						<Grid size={{ md: 6, xs: 12 }}>
							<FormControl fullWidth>
								<InputLabel>{t("settings.language.label")}</InputLabel>
								<Select
									value={settings.language}
									label={t("settings.language.label")}
									onChange={(e) => handlePreferenceChange("language", "", e.target.value)}
								>
									<MenuItem value="en">English</MenuItem>
									<MenuItem value="es">Español</MenuItem>
									<MenuItem value="fr">Français</MenuItem>
									<MenuItem value="de">Deutsch</MenuItem>
									<MenuItem value="zh">中文</MenuItem>
									<MenuItem value="ja">日本語</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid size={{ md: 6, xs: 12 }}>
							<Box>
								<Typography variant="h6" gutterBottom>
									{t("settings.autoSave")}
								</Typography>
								<Typography variant="body2" color="text.secondary" gutterBottom>
									{t("settings.autoSave.subtitle")}
								</Typography>
								<Switch
									checked={settings.autoSave}
									onChange={(e) => handlePreferenceChange("autoSave", "", e.target.checked)}
								/>
							</Box>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Privacy Settings */}
			<Card>
				<CardHeader
					avatar={<ShieldCheckIcon fontSize="var(--icon-fontSize-lg)" />}
					title={t("settings.privacy")}
					subheader={t("settings.privacy.subtitle")}
				/>
				<Divider />
				<CardContent>
					<Grid container spacing={4}>
						<Grid size={{ md: 6, xs: 12 }}>
							<Typography variant="h6" gutterBottom>
								{t("settings.privacy.dataCollection")}
							</Typography>
							<FormGroup>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.privacy.analytics}
											onChange={(e) => handlePreferenceChange("privacy", "analytics", e.target.checked)}
										/>
									}
									label={t("settings.privacy.analytics")}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={settings.privacy.cookies}
											onChange={(e) => handlePreferenceChange("privacy", "cookies", e.target.checked)}
										/>
									}
									label={t("settings.privacy.cookies")}
								/>
							</FormGroup>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Save Actions */}
			<Card>
				<CardContent>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Typography variant="h6">{t("actions.save")}</Typography>
						<Stack direction="row" spacing={2}>
							<Button variant="outlined" onClick={handleReset}>
								{t("actions.reset")}
							</Button>
							<Button variant="contained" onClick={handleSave} size="large">
								{t("actions.save")}
							</Button>
						</Stack>
					</Box>
					{saveMessage && (
						<Alert color="success" sx={{ mt: 2 }}>
							{saveMessage}
						</Alert>
					)}
				</CardContent>
			</Card>
		</Stack>
	);
}
