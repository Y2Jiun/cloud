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
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
		if (token) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`,
			};
		}

		try {
			const response = await fetch(url, config);

			let data: any = null;
			// Safely parse JSON; some endpoints may return empty body
			try {
				data = await response.json();
			} catch (_) {
				// If parsing fails, try text then wrap
				try {
					const text = await response.text();
					data = { success: response.ok, message: text } as any;
				} catch (_) {
					data = { success: response.ok } as any;
				}
			}

			if (!response.ok) {
				return {
					success: false,
					error: data?.error || data?.message || `HTTP error! status: ${response.status}`,
				};
			}

			return data as ApiResponse<T>;
		} catch (error) {
			console.warn("API request failed:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}

	// Generic HTTP methods
	async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: "GET" });
	}

	async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: "DELETE" });
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

	// Role change request methods
	async requestRoleChange(reason: string) {
		return this.request("/role-change/request", {
			method: "POST",
			body: JSON.stringify({ reason }),
		});
	}

	async getRoleChangeStatus() {
		return this.request("/role-change/status");
	}

	async getAllRoleChangeRequests(params?: { status?: string }) {
		const searchParams = new URLSearchParams();
		if (params?.status) searchParams.append("status", params.status);

		const query = searchParams.toString();
		return this.request(`/role-change/all${query ? `?${query}` : ""}`);
	}

	async approveRoleChange(requestId: number, adminNotes?: string) {
		return this.request(`/role-change/${requestId}/approve`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	async rejectRoleChange(requestId: number, adminNotes: string) {
		return this.request(`/role-change/${requestId}/reject`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
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
	async uploadImage(
		file: File,
		folder: "images" | "evidence" | "profiles" = "profiles"
	): Promise<ApiResponse<{ url: string; filename: string }>> {
		const formData = new FormData();
		formData.append("image", file);
		formData.append("folder", folder);

		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
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

	// Upload image from URL (for scam evidence)
	async uploadImageFromUrl(
		imageUrl: string,
		folder: "images" | "evidence" | "profiles" = "evidence"
	): Promise<ApiResponse<{ url: string; filename: string }>> {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
		const config: RequestInit = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify({ imageUrl, folder }),
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
				error: error instanceof Error ? error.message : "URL upload failed",
			};
		}
	}

	// Dashboard endpoints
	async getDashboardStats() {
		return this.request("/dashboard/stats");
	}

	// Truth-data dashboard stats
	async getDashboardStatsTruth() {
		return this.request("/dashboard/stats");
	}

	// User Checklists (Personal Scam Prevention Checklist)
	async getChecklists() {
		return this.request("/checklists");
	}

	async createChecklist(data: {
		title: string;
		description?: string;
		items?: Array<{ text: string; category?: string; orderIndex?: number }>;
	}) {
		return this.request("/checklists", { method: "POST", body: JSON.stringify(data) });
	}

	async updateChecklist(id: string, data: { title?: string; description?: string; isCompleted?: boolean }) {
		return this.request(`/checklists/${id}`, { method: "PUT", body: JSON.stringify(data) });
	}

	async deleteChecklist(id: string) {
		return this.request(`/checklists/${id}`, { method: "DELETE" });
	}

	async addChecklistItem(checklistId: string, data: { text: string; category?: string; orderIndex?: number }) {
		return this.request(`/checklists/${checklistId}/items`, { method: "POST", body: JSON.stringify(data) });
	}

	async updateChecklistItem(
		itemId: string,
		data: { text?: string; category?: string; isCompleted?: boolean; orderIndex?: number }
	) {
		return this.request(`/checklists/items/${itemId}`, { method: "PUT", body: JSON.stringify(data) });
	}

	async deleteChecklistItem(itemId: string) {
		return this.request(`/checklists/items/${itemId}`, { method: "DELETE" });
	}

	async getRecentActivity() {
		return this.request("/dashboard/activity");
	}

	// Scam Reports endpoints
	async getScamReports() {
		return this.request("/scam-reports");
	}

	async getScamReport(id: string) {
		return this.request(`/scam-reports/${id}`);
	}

	async createScamReport(data: {
		title: string;
		description: string;
		scammerInfo: string;
		platform: string;
		evidenceFiles?: string[];
	}) {
		return this.request("/scam-reports", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateScamReport(
		id: string,
		data: {
			title?: string;
			description?: string;
			scammerInfo?: string;
			platform?: string;
			status?: string;
		}
	) {
		return this.request(`/scam-reports/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteScamReport(id: string) {
		return this.request(`/scam-reports/${id}`, {
			method: "DELETE",
		});
	}

	// Scam Alerts endpoints
	async getScamAlerts() {
		return this.request("/scam-alerts");
	}

	async getScamAlert(id: string) {
		return this.request(`/scam-alerts/${id}`);
	}

	async createScamAlert(data: {
		title: string;
		description: string;
		severity: "HIGH" | "MEDIUM" | "LOW";
		targetAudience: "ALL" | "SPECIFIC_GROUPS";
		expiresAt?: Date;
	}) {
		return this.request("/scam-alerts", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateScamAlert(
		id: string,
		data: {
			title?: string;
			description?: string;
			severity?: "HIGH" | "MEDIUM" | "LOW";
			targetAudience?: "ALL" | "SPECIFIC_GROUPS";
			expiresAt?: Date;
		}
	) {
		return this.request(`/scam-alerts/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteScamAlert(id: string) {
		return this.request(`/scam-alerts/${id}`, {
			method: "DELETE",
		});
	}

	async approveScamAlert(id: string, adminNotes?: string) {
		return this.request(`/scam-alerts/${id}/approve`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	async rejectScamAlert(id: string, adminNotes: string) {
		return this.request(`/scam-alerts/${id}/reject`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	// Legal Cases endpoints
	async getLegalCases(params?: { status?: string }) {
		const queryParams = new URLSearchParams();
		if (params?.status) queryParams.append("status", params.status);
		return this.request(`/legal-cases?${queryParams.toString()}`);
	}

	async getLegalCase(id: string) {
		return this.request(`/legal-cases/${id}`);
	}

	async createLegalCase(data: {
		title: string;
		description: string;
		caseNumber: string;
		priority?: "HIGH" | "MEDIUM" | "LOW";
	}) {
		return this.request("/legal-cases", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateLegalCase(
		id: string,
		data: {
			title?: string;
			description?: string;
			priority?: "HIGH" | "MEDIUM" | "LOW";
		}
	) {
		return this.request(`/legal-cases/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteLegalCase(id: string) {
		return this.request(`/legal-cases/${id}`, {
			method: "DELETE",
		});
	}

	async approveLegalCase(id: string, adminNotes?: string) {
		return this.request(`/legal-cases/${id}/approve`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	async rejectLegalCase(id: string, adminNotes: string) {
		return this.request(`/legal-cases/${id}/reject`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	async uploadDocument(caseId: string, formData: FormData) {
		return this.request(`/legal-cases/${caseId}/documents`, {
			method: "POST",
			body: formData,
			headers: {}, // Let browser set Content-Type for FormData
		});
	}

	async deleteDocument(documentId: string) {
		return this.request(`/legal-cases/documents/${documentId}`, {
			method: "DELETE",
		});
	}

	async downloadDocument(documentId: string) {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${this.baseURL}/legal-cases/documents/${documentId}/download`, {
			headers,
		});
		return response;
	}

	async getLegalCaseStatistics() {
		return this.request("/legal-cases/statistics");
	}

	// FAQ endpoints
	async getAllFAQs(params?: { search?: string; category?: string; status?: string; sortBy?: string }) {
		const queryParams = new URLSearchParams();
		if (params?.search) queryParams.append("search", params.search);
		if (params?.category) queryParams.append("category", params.category);
		if (params?.status) queryParams.append("status", params.status);
		if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

		return this.request(`/faqs?${queryParams.toString()}`);
	}

	async getFAQById(id: string) {
		return this.request(`/faqs/${id}`);
	}

	async getAdminFAQs() {
		return this.request("/faqs/admin/all");
	}

	async createFAQ(data: {
		title: string;
		content: string;
		category: string;
		tags: string;
		status: string;
		isPinned: boolean;
	}) {
		return this.request("/faqs", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateFAQ(
		id: string,
		data: {
			title?: string;
			content?: string;
			category?: string;
			tags?: string;
			status?: string;
			isPinned?: boolean;
		}
	) {
		return this.request(`/faqs/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteFAQ(id: string) {
		return this.request(`/faqs/${id}`, {
			method: "DELETE",
		});
	}

	async markFAQHelpful(id: string) {
		return this.request(`/faqs/${id}/helpful`, {
			method: "POST",
		});
	}

	// Role Change Request endpoints
	async getRoleChangeStatus() {
		return this.request("/role-change/status");
	}

	async createRoleChangeRequest(data: { requestedRole: number; reason: string }) {
		return this.request("/role-change", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async getAllRoleChangeRequests() {
		return this.request("/role-change");
	}

	async approveRoleChangeRequest(id: string, adminNotes?: string) {
		return this.request(`/role-change/${id}/approve`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	async rejectRoleChangeRequest(id: string, adminNotes: string) {
		return this.request(`/role-change/${id}/reject`, {
			method: "PUT",
			body: JSON.stringify({ adminNotes }),
		});
	}

	// Scam Reports endpoints
	async getScamReports() {
		return this.request("/scam-reports");
	}

	async getScamReportById(id: string) {
		return this.request(`/scam-reports/${id}`);
	}

	async createScamReport(data: { title: string; description: string; scammerInfo: string; platform: string }) {
		return this.request("/scam-reports", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateScamReport(
		id: string,
		data: {
			title?: string;
			description?: string;
			scammerInfo?: string;
			platform?: string;
			status?: string;
		}
	) {
		return this.request(`/scam-reports/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteScamReport(id: string) {
		return this.request(`/scam-reports/${id}`, {
			method: "DELETE",
		});
	}

	async getDashboardSeries() {
		return this.request("/dashboard/series");
	}

	// Questionnaire endpoints
	async getMyQuestionnaires() {
		return this.request("/questionnaires/my");
	}

	async getQuestionnaire(id: number) {
		return this.request(`/questionnaires/${id}`);
	}

	async createQuestionnaire(data: any) {
		return this.request("/questionnaires", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateQuestionnaire(id: number, data: any) {
		return this.request(`/questionnaires/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteQuestionnaire(id: number) {
		return this.request(`/questionnaires/${id}`, { method: "DELETE" });
	}

	async toggleQuestionnaireStatus(id: number, isActive: boolean) {
		return this.request(`/questionnaires/${id}/status`, {
			method: "PATCH",
			body: JSON.stringify({ isActive }),
		});
	}

	async getActiveQuestionnaires() {
		return this.request("/questionnaires/active");
	}

	async submitQuestionnaireResponse(data: any) {
		return this.request(`/questionnaires/${data.questionnaireId}/respond`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async exportQuestionnaireCSV(id: number) {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${this.baseURL}/questionnaires/${id}/export/csv`, {
			headers,
		});
		return response;
	}

	async exportQuestionnairePDF(id: number) {
		const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${this.baseURL}/questionnaires/${id}/export/pdf`, {
			headers,
		});
		return response;
	}
}

export const apiClient = new ApiClient();
