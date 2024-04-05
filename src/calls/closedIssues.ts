import type { OctokitResponse } from '@octokit/types';
import { config } from 'dotenv';
import type { Octokit } from 'octokit';

import type {
	ClosedIssuesItem,
	QueriedData,
	ResolvedConfig,
	UserData,
} from '../types';

config();

async function* getClosedIssuesPaged(api: Octokit, config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await getClosedIssuesPage(api, page, config);

		yield res;

		const len = res.data.length;
		const lastEntryDate = new Date(res.data[len - 1].closed_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const getClosedIssuesPage = async (
	api: Octokit,
	page: number,
	config: ResolvedConfig
): Promise<OctokitResponse<ClosedIssuesItem[]>> => {
	const { repo, org } = config;
	const pageSize = 30;
	return await api.request(
		`GET /repos/{owner}/{repo}/issues?state=closed&per_page=${pageSize}&page=${page}`,
		{
			owner: org,
			repo,
		}
	);
};

export const retrieveAllClosedIssues = async (
	api: Octokit,
	config: ResolvedConfig,
	data: QueriedData
): Promise<void> => {
	const concatData: ClosedIssuesItem[] = [];
	const pages = await getClosedIssuesPaged(api, config);
	const startDate = new Date(config.startDate);
	let totalCount = 0;

	for await (const page of pages) {
		if (page.status === 200) {
			concatData.push(...page.data);
		}
	}

	for (let i = 0; i < concatData.length; i++) {
		if (new Date(concatData[i].closed_at) < startDate) break;

		if (data.users[concatData[i].user.login]) {
			data.users[concatData[i].user.login].closedIssues.count =
				data.users[concatData[i].user.login].closedIssues.count + 1;
		} else {
			(data.users[concatData[i].user.login] as unknown as UserData) = {};
			data.users[concatData[i].user.login].closedIssues = {
				count: 1,
				contributorType:
					concatData[i].author_association === 'MEMBER'
						? 'internal'
						: 'external',
			};
		}

		totalCount++;
	}

	data.totalClosedIssues = totalCount;
};
