// TODO - implement filters
export interface ConfigJSON {
	org?: string;
	repo?: string;
	startDate?: string;
	endDate?: string;
	writeTo?: string;
	pathToConfig?: string;
}

export interface ResolvedConfig {
	org: string;
	repo: string;
	startDate: string;
	endDate?: string;
	writeTo?: string;
	pathToConfig?: string;
}

export type QueriedData = {
	totalClosedIssues: number;
	users: UserData;
};

export type UserData = {
	[x: string]: {
		closedIssues: ClosedIssueData;
	};
};

export interface ClosedIssueData {
	count: number;
	contributorType: 'external' | 'internal';
}

export interface OctokitBase<T> {
	status: number;
	url: string;
	headers: object;
	data: T;
}

export interface ClosedIssuesItem {
	user: {
		login: string;
	};
	closed_at: string;
	author_association: string;
}
