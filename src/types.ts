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
	totalOpenedIssues: number;
	totalPRsMerged: number;
	totalReleases: number;
	users: UserData;
};

export type UserData = {
	[x: string]: {
		closedIssues: number;
		mergedPRs: number;
		reviews: ReviewData;
	};
};

export interface ReviewData {
	approved: number;
	changesRequested: number;
	comments: number;
}

export interface OctokitBase<T> {
	status: number;
	url: string;
	headers: object;
	data: T;
}

export interface IssuesItem {
	user: {
		login: string;
	};
	closed_at: string;
	created_at: string;
	author_association: string;
}

export interface PrResponse {
	total_count: number;
	incomplete_results: boolean;
	items: {
		title: string;
		number: number;
		user: {
			login: string;
		};
		pull_request: {
			merged_at: string;
		};
	}[];
}

export interface PrReviewResponse {
	user: {
		login: string;
	};
	state: 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED';
}
