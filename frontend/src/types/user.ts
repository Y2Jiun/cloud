export interface User {
	id: string;
	userid?: number;
	name?: string;
	avatar?: string;
	profilepic?: string;
	email?: string;
	username?: string;
	roles?: number; // 1 = admin, 2 = legal_officer, 3 = user
	contact?: string;
	created_at?: Date;
	updated_at?: Date;

	[key: string]: unknown;
}
