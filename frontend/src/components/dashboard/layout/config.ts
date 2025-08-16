import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "overview", title: "nav.overview", href: paths.dashboard.overview, icon: "chart-pie" },
	{ key: "customers", title: "nav.customers", href: paths.dashboard.customers, icon: "users" },
	{ key: "integrations", title: "nav.integrations", href: paths.dashboard.integrations, icon: "plugs-connected" },
	{ key: "settings", title: "nav.settings", href: paths.dashboard.settings, icon: "gear-six" },
	{ key: "account", title: "nav.account", href: paths.dashboard.account, icon: "user" },
	{ key: "error", title: "nav.error", href: paths.errors.notFound, icon: "x-square" },
] satisfies NavItemConfig[];
