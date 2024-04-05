// TODO - implement filters
export interface ConfigJSON {
	org?: string;
	repo?: string;
	startDate?: string;
	endDate?: string;
	writeTo?: string;
	pathToConfig?: string;
	pullRequests?: {
		releasePattern?: string[];
	};
}

export interface ResolvedConfig {
	org: string;
	repo: string;
	startDate: string;
	endDate?: string;
	writeTo?: string;
	pathToConfig?: string;
	releasePattern?: string[];
}

export type QueriedData = {
	totalClosedIssues: number;
	totalPRsMerged: number;
	totalReleases: number;
	users: UserData;
};

export type UserData = {
	[x: string]: {
		closedIssues: ClosedIssueData;
		mergedPRs: number;
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

export interface PrResponse {
	total_count: number;
	incomplete_results: boolean;
	items: {
		title: string;
		user: {
			login: string;
		};
		pull_request: {
			merged_at: string;
		};
	}[];
}
