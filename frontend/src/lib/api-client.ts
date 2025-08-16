// API client for making requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string = API_BASE_URL) {
		this.baseURL = baseURL;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		// Add auth token if available
		const token = localStorage.getItem("auth-token");
		if (token) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`,
			};
		}

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.error || `HTTP error! status: ${response.status}`,
				};
			}

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}

	// Auth endpoints
	async login(email: string, password: string) {
		return this.request("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
	}

	async register(userData: { email: string; password: string; username: string; name?: string; contact?: string }) {
		return this.request("/auth/register", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}

	async getProfile() {
		return this.request("/auth/profile");
	}

	async updateProfile(userData: any) {
		return this.request("/auth/profile", {
			method: "PUT",
			body: JSON.stringify(userData),
		});
	}

	// Password reset with OTP endpoints
	async sendPasswordResetOtp(email: string) {
		return this.request("/auth/send-reset-otp", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async verifyPasswordResetOtp(email: string, otp: string) {
		return this.request("/auth/verify-reset-otp", {
			method: "POST",
			body: JSON.stringify({ email, otp }),
		});
	}

	async resetPasswordWithToken(token: string, newPassword: string) {
		return this.request("/auth/reset-password-with-token", {
			method: "POST",
			body: JSON.stringify({ token, newPassword }),
		});
	}

	// Users endpoints
	async getUsers(params?: { page?: number; limit?: number; search?: string }) {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append("page", params.page.toString());
		if (params?.limit) searchParams.append("limit", params.limit.toString());
		if (params?.search) searchParams.append("search", params.search);

		const query = searchParams.toString();
		return this.request(`/users${query ? `?${query}` : ""}`);
	}

	async getUserById(id: string) {
		return this.request(`/users/${id}`);
	}

	async updateUser(id: string, userData: any) {
		return this.request(`/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(userData),
		});
	}

	async deleteUser(id: string) {
		return this.request(`/users/${id}`, {
			method: "DELETE",
		});
	}

	// Customers endpoints
	async getCustomers(params?: { page?: number; limit?: number; search?: string }) {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append("page", params.page.toString());
		if (params?.limit) searchParams.append("limit", params.limit.toString());
		if (params?.search) searchParams.append("search", params.search);

		const query = searchParams.toString();
		return this.request(`/customers${query ? `?${query}` : ""}`);
	}

	async getCustomerById(id: string) {
		return this.request(`/customers/${id}`);
	}

	async createCustomer(customerData: any) {
		return this.request("/customers", {
			method: "POST",
			body: JSON.stringify(customerData),
		});
	}

	async updateCustomer(id: string, customerData: any) {
		return this.request(`/customers/${id}`, {
			method: "PUT",
			body: JSON.stringify(customerData),
		});
	}

	async deleteCustomer(id: string) {
		return this.request(`/customers/${id}`, {
			method: "DELETE",
		});
	}

	// Upload endpoints
	async uploadImage(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
		const formData = new FormData();
		formData.append("image", file);

		const token = localStorage.getItem("auth-token");
		const config: RequestInit = {
			method: "POST",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: formData,
		};

		try {
			const response = await fetch(`${this.baseURL}/upload/image`, config);
			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.error || `HTTP error! status: ${response.status}`,
				};
			}

			return data;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Upload failed",
			};
		}
	}

	// Dashboard endpoints
	async getDashboardStats() {
		return this.request("/dashboard/stats");
	}

	async getRecentActivity() {
		return this.request("/dashboard/activity");
	}
}

export const apiClient = new ApiClient();
