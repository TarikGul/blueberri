import { HEADERS, PAGE_SIZE } from '../consts';
import type { IssuesItem, QueriedData, ResolvedConfig } from '../types';
import { request } from './request';
import { createUserTemplate } from './util';

async function* getClosedIssuesPaged(config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await getClosedIssuesPage(page, config);

		yield res;

		const len = res.items.length;
		if (len === 0) {
			isDone = true;
			break;
		}
		const lastEntryDate = new Date(res.items[len - 1].closed_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const getClosedIssuesPage = async (page: number, config: ResolvedConfig): Promise<{ items: IssuesItem[] }> => {
	const { repo, org } = config;
	return await request(
		`https://api.github.com/search/issues?per_page=${PAGE_SIZE}&page=${page}&q=is:issue%20is:closed%20repo:${org}/${repo}`,
		{ ...HEADERS, method: 'GET' }
	);
};

export const retrieveAllClosedIssues = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const concatData: IssuesItem[] = [];
	const pages = await getClosedIssuesPaged(config);
	const startDate = new Date(config.startDate);
	let totalCount = 0;

	for await (const page of pages) {
		concatData.push(...page.items);
	}

	concatData.sort(
		(a, b) => (new Date(b.closed_at) as unknown as number) - (new Date(a.closed_at) as unknown as number)
	);

	for (let i = 0; i < concatData.length; i++) {
		if (new Date(concatData[i].closed_at) < startDate) break;

		// When the user doesn't exists. Create a template for them.
		if (!data.users[concatData[i].user.login]) data.users[concatData[i].user.login] = createUserTemplate();

		const prevCount = data.users[concatData[i].user.login].closedIssues;
		data.users[concatData[i].user.login].closedIssues = prevCount + 1;

		totalCount++;
	}

	data.totalClosedIssues = totalCount;
};
