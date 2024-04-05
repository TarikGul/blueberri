import { HEADERS, PAGE_SIZE } from '../consts';
import type { IssuesItem, QueriedData, ResolvedConfig } from '../types';
import { request } from './request';

async function* getOpenedIssuesPaged(config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await getOpenedIssuesPage(page, config);

		yield res;

		const len = res.items.length;
		const lastEntryDate = new Date(res.items[len - 1].closed_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const getOpenedIssuesPage = async (page: number, config: ResolvedConfig): Promise<{ items: IssuesItem[] }> => {
	const { repo, org } = config;
	return await request(
		`https://api.github.com/search/issues?per_page=${PAGE_SIZE}&page=${page}&q=is:issue%20is:open%20repo:${org}/${repo}`,
		{ ...HEADERS, method: 'GET' }
	);
};

export const retrieveAllOpenedIssues = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const concatData: IssuesItem[] = [];
	const pages = await getOpenedIssuesPaged(config);
	const startDate = new Date(config.startDate);
	let totalCount = 0;

	for await (const page of pages) {
		concatData.push(...page.items);
	}

	for (let i = 0; i < concatData.length; i++) {
		if (new Date(concatData[i].created_at) < startDate) break;

		totalCount++;
	}

	data.totalOpenedIssues = totalCount;
};
