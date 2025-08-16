import * as React from "react";
import type { Viewport } from "next";

import "@/styles/global.css";

import { I18nProvider } from "@/contexts/i18n-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { UserProvider } from "@/contexts/user-context";
import { LocalizationProvider } from "@/components/core/localization-provider";

export const viewport = { width: "device-width", initialScale: 1 } satisfies Viewport;

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<html lang="en">
			<body>
				<LocalizationProvider>
					<UserProvider>
						<SettingsProvider>
							<I18nProvider>{children}</I18nProvider>
						</SettingsProvider>
					</UserProvider>
				</LocalizationProvider>
			</body>
		</html>
	);
}
