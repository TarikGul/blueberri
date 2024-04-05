import { HEADERS, PAGE_SIZE } from '../consts';
import type { ClosedIssuesItem, QueriedData, ResolvedConfig, UserData } from '../types';
import { request } from './request';

async function* getClosedIssuesPaged(config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await getClosedIssuesPage(page, config);

		yield res;

		const len = res.length;
		const lastEntryDate = new Date(res[len - 1].closed_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const getClosedIssuesPage = async (page: number, config: ResolvedConfig): Promise<ClosedIssuesItem[]> => {
	const { repo, org } = config;
	return await request(
		`https://api.github.com/repos/${org}/${repo}/issues?state=closed&per_page=${PAGE_SIZE}&page=${page}`,
		{ ...HEADERS, method: 'GET' }
	);
};

export const retrieveAllClosedIssues = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const concatData: ClosedIssuesItem[] = [];
	const pages = await getClosedIssuesPaged(config);
	const startDate = new Date(config.startDate);
	let totalCount = 0;

	for await (const page of pages) {
		concatData.push(...page);
	}

	for (let i = 0; i < concatData.length; i++) {
		if (new Date(concatData[i].closed_at) < startDate) break;

		if (data.users[concatData[i].user.login] && data.users[concatData[i].user.login].closedIssues) {
			data.users[concatData[i].user.login].closedIssues.count =
				data.users[concatData[i].user.login].closedIssues.count + 1;
		} else {
			(data.users[concatData[i].user.login] as unknown as UserData) = {};
			data.users[concatData[i].user.login].closedIssues = {
				count: 1,
				contributorType: concatData[i].author_association === 'MEMBER' ? 'internal' : 'external',
			};
		}

		totalCount++;
	}

	data.totalClosedIssues = totalCount;
};
