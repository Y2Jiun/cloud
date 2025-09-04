import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{
		key: "overview",
		title: "Overview",
		href: paths.dashboard.overview,
		icon: "chart-pie",
	},
	// Scam Reporting System
	{ key: "scam-reports", title: "nav.scam-reports", href: paths.dashboard.scamReports, icon: "warning" },
	{ key: "scam-alerts", title: "nav.scam-alerts", href: paths.dashboard.scamAlerts, icon: "bell" },
	{ key: "legal-cases", title: "nav.legal-cases", href: paths.dashboard.legalCases, icon: "scales" },
	// Questionnaire Management (Legal Officer only)
	{ key: "questionnaires", title: "Questionnaires", href: paths.dashboard.questionnaires, icon: "clipboard" },
	// Answer Questionnaires (Regular users only)
	{
		key: "answer-questionnaires",
		title: "Answer Questionnaires",
		href: paths.dashboard.answerQuestionnaires,
		icon: "clipboard",
	},
	// Help & FAQ
	{ key: "help", title: "Help & FAQ", href: paths.dashboard.help, icon: "question" },
];

// Admin-specific navigation items
export const adminNavItems = [
	{ key: "overview", title: "nav.overview", href: paths.dashboard.overview, icon: "chart-pie" },
	{ key: "customers", title: "nav.customers", href: paths.dashboard.customers, icon: "users" },
	// Admin Scam Management
	{ key: "scam-reports", title: "Scam Reports", href: paths.dashboard.adminScamReports, icon: "warning" },
	{ key: "scam-alerts", title: "nav.scam-alerts", href: paths.dashboard.scamAlerts, icon: "bell" },
	{ key: "legal-cases", title: "nav.legal-cases", href: paths.dashboard.legalCases, icon: "scales" },
	// Admin Management
	{ key: "help", title: "Help & FAQ Management", href: paths.dashboard.help, icon: "question" },
	{ key: "role-requests", title: "Role Change Requests", href: paths.dashboard.adminRoleRequests, icon: "users" },
];

// Legal Officer-specific navigation items
export const legalOfficerNavItems = [
	{ key: "overview", title: "nav.overview", href: paths.dashboard.overview, icon: "chart-pie" },
	// Legal Officer specific functions
	{ key: "questionnaires", title: "Questionnaire Management", href: paths.dashboard.questionnaires, icon: "clipboard" },
	{ key: "legal-cases", title: "Legal Cases", href: paths.dashboard.legalCases, icon: "scales" },
	{ key: "scam-reports", title: "Scam Reports Review", href: paths.dashboard.scamReports, icon: "warning" },
	{ key: "scam-alerts", title: "Scam Alerts", href: paths.dashboard.scamAlerts, icon: "bell" },
	// Legal Officer management
	{ key: "help", title: "Help & FAQ Management", href: paths.dashboard.help, icon: "question" },
];

// Regular user navigation items
export const userNavItems = [
	{ key: "overview", title: "nav.overview", href: paths.dashboard.overview, icon: "chart-pie" },
	// User-specific functions
	{
		key: "answer-questionnaires",
		title: "Answer Questionnaires",
		href: paths.dashboard.answerQuestionnaires,
		icon: "clipboard",
	},
	{ key: "scam-reports", title: "Submit Scam Report", href: paths.dashboard.scamReports, icon: "warning" },
	{ key: "scam-alerts", title: "View Scam Alerts", href: paths.dashboard.scamAlerts, icon: "bell" },
	{ key: "legal-cases", title: "View Legal Cases", href: paths.dashboard.legalCases, icon: "scales" },
	// User checklist (only for regular users)
	{ key: "checklists", title: "My Scam Checklist", href: paths.dashboard.checklists, icon: "list" },
	// User help
	{ key: "help", title: "Help & FAQ", href: paths.dashboard.help, icon: "question" },
];
