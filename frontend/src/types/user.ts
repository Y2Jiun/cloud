export interface User {
	id: string;
	name?: string;
	avatar?: string;
	email?: string;
	username?: string;
	roles?: number;
	contact?: string;

	[key: string]: unknown;
}
