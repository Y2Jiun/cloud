"use client";

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";

import EmotionCache from "@/components/core/theme-provider/emotion-cache";
import { createTheme as createCustomTheme } from "@/styles/theme/create-theme";

export interface Settings {
	darkMode: boolean;
	fontSize: number;
	language: string;
	notifications: {
		email: boolean;
		push: boolean;
		security: boolean;
	};
	privacy: {
		analytics: boolean;
		cookies: boolean;
	};
	autoSave: boolean;
	compactMode: boolean;
}

const defaultSettings: Settings = {
	darkMode: false,
	fontSize: 16,
	language: "en",
	notifications: {
		email: true,
		push: false,
		security: true,
	},
	privacy: {
		analytics: true,
		cookies: true,
	},
	autoSave: true,
	compactMode: false,
};

export interface SettingsContextValue {
	settings: Settings;
	updateSettings: (newSettings: Partial<Settings>) => void;
	resetSettings: () => void;
}

export const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export function useSettings(): SettingsContextValue {
	const context = React.useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}

interface SettingsProviderProps {
	children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps): React.JSX.Element {
	const [settings, setSettings] = React.useState<Settings>(defaultSettings);

	// Load settings from localStorage on mount
	React.useEffect(() => {
		try {
			const savedSettings = localStorage.getItem("userPreferences");
			console.log("Loading settings from localStorage:", savedSettings);
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings);
				const merged = { ...defaultSettings, ...parsed };
				console.log("Merged settings:", merged);
				setSettings(merged);
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	}, []);

	// Save settings to localStorage whenever they change
	React.useEffect(() => {
		try {
			console.log("Saving settings to localStorage:", settings);
			localStorage.setItem("userPreferences", JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	}, [settings]);

	// CssVarsProvider will handle document color scheme automatically

	const updateSettings = React.useCallback((newSettings: Partial<Settings>) => {
		console.log("updateSettings called with:", newSettings);
		setSettings((prev) => {
			console.log("Previous settings:", prev);
			const updated = { ...prev };

			// Handle nested objects properly
			Object.keys(newSettings).forEach((key) => {
				const value = newSettings[key as keyof Settings];
				if (typeof value === "object" && value !== null && !Array.isArray(value)) {
					updated[key as keyof Settings] = { ...prev[key as keyof Settings], ...value } as any;
				} else {
					updated[key as keyof Settings] = value as any;
				}
			});

			console.log("Updated settings:", updated);
			return updated;
		});
	}, []);

	const resetSettings = React.useCallback(() => {
		setSettings(defaultSettings);
		localStorage.removeItem("userPreferences");
	}, []);

	// Create dynamic theme based on settings
	const theme = React.useMemo(() => {
		console.log("Creating theme with settings:", settings);
		const baseTheme = createCustomTheme();

		const newTheme = createTheme({
			...baseTheme,
			// Set both defaultColorScheme and palette.mode for compatibility
			defaultColorScheme: settings.darkMode ? "dark" : "light",
			palette: {
				...baseTheme.palette,
				mode: settings.darkMode ? "dark" : "light",
			},
			typography: {
				...baseTheme.typography,
				fontSize: settings.fontSize,
				// Scale all typography variants based on fontSize
				h1: { fontSize: `${settings.fontSize * 2.5}px` },
				h2: { fontSize: `${settings.fontSize * 2}px` },
				h3: { fontSize: `${settings.fontSize * 1.75}px` },
				h4: { fontSize: `${settings.fontSize * 1.5}px` },
				h5: { fontSize: `${settings.fontSize * 1.25}px` },
				h6: { fontSize: `${settings.fontSize * 1.1}px` },
				body1: { fontSize: `${settings.fontSize}px` },
				body2: { fontSize: `${settings.fontSize * 0.875}px` },
				caption: { fontSize: `${settings.fontSize * 0.75}px` },
			},
			spacing: settings.compactMode ? 6 : 8, // Reduce spacing in compact mode
			components: {
				...baseTheme.components,
				MuiCard: {
					styleOverrides: {
						root: {
							padding: settings.compactMode ? "12px" : "16px",
						},
					},
				},
				MuiCardContent: {
					styleOverrides: {
						root: {
							padding: settings.compactMode ? "12px" : "16px",
							"&:last-child": {
								paddingBottom: settings.compactMode ? "12px" : "16px",
							},
						},
					},
				},
			},
		});
		console.log("Created theme:", newTheme);
		return newTheme;
	}, [settings.darkMode, settings.fontSize, settings.compactMode]);

	const contextValue = React.useMemo(
		() => ({
			settings,
			updateSettings,
			resetSettings,
		}),
		[settings, updateSettings, resetSettings]
	);

	return (
		<SettingsContext.Provider value={contextValue}>
			<EmotionCache options={{ key: "mui" }}>
				<CssVarsProvider
					theme={theme}
					disableTransitionOnChange
					defaultMode={settings.darkMode ? "dark" : "light"}
					key={`theme-${settings.darkMode ? "dark" : "light"}`}
				>
					<CssBaseline />
					{children}
				</CssVarsProvider>
			</EmotionCache>
		</SettingsContext.Provider>
	);
}
