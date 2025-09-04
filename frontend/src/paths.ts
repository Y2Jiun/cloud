export const paths = {
	home: "/",
	auth: {
		signIn: "/auth/sign-in",
		signUp: "/auth/sign-up",
		resetPassword: "/auth/reset-password",
		verifyOtp: "/auth/verify-otp",
		newPassword: "/auth/new-password",
		terms: "/auth/terms",
	},
	dashboard: {
		overview: "/dashboard",
		account: "/dashboard/account",
		customers: "/dashboard/customers",
		integrations: "/dashboard/integrations",
		settings: "/dashboard/settings",
		// Scam Reporting System
		scamReports: "/dashboard/scam-reports",
		scamAlerts: "/dashboard/scam-alerts",
		legalCases: "/dashboard/legal-cases",
		// Help & FAQ
		faqs: "/dashboard/faqs",
		help: "/dashboard/help",
		// Role Change Request
		roleRequest: "/dashboard/role-request",
		roleRequests: "/dashboard/admin/role-requests",
		adminRoleRequests: "/dashboard/admin/role-requests",
		// Admin Management
		users: "/dashboard/users",
		adminScamReports: "/dashboard/admin/scam-reports",
		adminScamAlerts: "/dashboard/admin/scam-alerts",
		adminLegalCases: "/dashboard/admin/legal-cases",
		checklists: "/dashboard/checklists",
		// Questionnaire System
		questionnaires: "/dashboard/questionnaires",
		questionnaireCreate: "/dashboard/questionnaires/create",
		questionnaireEdit: "/dashboard/questionnaires/edit",
		questionnaireView: "/dashboard/questionnaires/view",
		questionnaireAnswer: "/dashboard/questionnaires/answer",
		answerQuestionnaires: "/dashboard/questionnaires/answer",
	},
	errors: { notFound: "/errors/not-found" },
} as const;
