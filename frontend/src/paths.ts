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
	},
	errors: { notFound: "/errors/not-found" },
} as const;
