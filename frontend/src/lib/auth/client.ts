"use client";

import type { User } from "@/types/user";
import { apiClient } from "@/lib/api-client";

export interface SignUpParams {
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	password: string;
	username?: string; // Optional, will be generated if not provided
}

export interface SignInWithOAuthParams {
	provider: "google" | "discord";
}

export interface SignInWithPasswordParams {
	email: string;
	password: string;
}

export interface ResetPasswordParams {
	email: string;
}

export interface VerifyOtpParams {
	email: string;
	otp: string;
}

export interface NewPasswordParams {
	token: string;
	newPassword: string;
}

class AuthClient {
	async signUp(params: SignUpParams): Promise<{ error?: string }> {
		try {
			const { firstName, lastName, name, email, password, username } = params;

			// Use provided username or create one from first and last name
			const finalUsername = username || `${firstName.trim()}${lastName.trim()}`.toLowerCase();

			const response = await apiClient.register({
				email,
				password,
				username: finalUsername,
				name, // Send the combined name
			});

			if (!response.success) {
				return { error: response.error || "Registration failed" };
			}

			// Store the token
			if (response.data?.token) {
				localStorage.setItem("auth-token", response.data.token);
			}

			return {};
		} catch (error) {
			return { error: "Registration failed" };
		}
	}

	async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
		return { error: "Social authentication not implemented" };
	}

	async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
		try {
			const { email, password } = params;

			const response = await apiClient.login(email, password);

			if (!response.success) {
				return { error: response.error || "Invalid credentials" };
			}

			// Store the token
			if (response.data?.token) {
				localStorage.setItem("auth-token", response.data.token);
			}

			return {};
		} catch (error) {
			console.error("Login error:", error);
			return { error: "Login failed" };
		}
	}

	async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
		try {
			const { email } = params;
			const response = await apiClient.sendPasswordResetOtp(email);

			if (!response.success) {
				return { error: response.error || "Failed to send OTP" };
			}

			return {};
		} catch (error) {
			return { error: "Failed to send OTP" };
		}
	}

	async verifyOtp(params: VerifyOtpParams): Promise<{ error?: string; data?: { token: string } }> {
		try {
			const { email, otp } = params;
			const response = await apiClient.verifyPasswordResetOtp(email, otp);

			if (!response.success) {
				return { error: response.error || "Invalid OTP" };
			}

			return { data: response.data };
		} catch (error) {
			return { error: "OTP verification failed" };
		}
	}

	async updatePassword(params: NewPasswordParams): Promise<{ error?: string }> {
		try {
			const { token, newPassword } = params;
			const response = await apiClient.resetPasswordWithToken(token, newPassword);

			if (!response.success) {
				return { error: response.error || "Failed to update password" };
			}

			return {};
		} catch (error) {
			return { error: "Password update failed" };
		}
	}

	async getUser(): Promise<{ data?: User | null; error?: string }> {
		try {
			const token = localStorage.getItem("auth-token");

			if (!token) {
				return { data: null };
			}

			const response = await apiClient.getProfile();

			if (!response.success) {
				// Token might be invalid, remove it
				localStorage.removeItem("auth-token");
				return { data: null };
			}

			// Transform backend user data to frontend User type
			const backendUser = response.data;
			const user: User = {
				id: backendUser.userid?.toString() || backendUser.id,
				name:
					backendUser.name ||
					backendUser.username ||
					`${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim(),
				email: backendUser.email,
				avatar: backendUser.profilepic || backendUser.avatar || "/assets/avatar.png",
				username: backendUser.username,
				roles: backendUser.roles,
				contact: backendUser.contact,
			};

			return { data: user };
		} catch (error) {
			// Remove invalid token
			localStorage.removeItem("auth-token");
			return { data: null };
		}
	}

	async signOut(): Promise<{ error?: string }> {
		localStorage.removeItem("auth-token");

		return {};
	}
}

export const authClient = new AuthClient();
