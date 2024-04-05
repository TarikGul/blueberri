import { HEADERS } from '../consts';
import type { PrResponse, QueriedData, ResolvedConfig, UserData } from '../types';
import { request } from './request';

async function* getMergedPRsPaged(config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await retrieveMergedPRsPage(page, config);

		yield res;

		const len = res.items.length;
		const lastEntryDate = new Date(res.items[len - 1].pull_request.merged_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const retrieveMergedPRsPage = async (page: number, config: ResolvedConfig): Promise<PrResponse> => {
	const { repo, org } = config;
	return await request(`https://api.github.com/search/issues?page=${page}&q=is:pr%20is:merged%20repo:${org}/${repo}`, {
		...HEADERS,
		method: 'GET',
	});
};

export const retrievePRs = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const mergedData = [];
	const pages = await getMergedPRsPaged(config);
	const startDate = new Date(config.startDate);
	let totalPRsMerged = 0;

	for await (const page of pages) {
		mergedData.push(...page.items);
	}

	// We should also possibly create a map and request all the reviews of each PR.

	// Finds all merged prs
	for (let i = 0; i < mergedData.length; i++) {
		if (new Date(mergedData[i].pull_request.merged_at) < startDate) break;

		if (data.users[mergedData[i].user.login] && data.users[mergedData[i].user.login].mergedPRs) {
			data.users[mergedData[i].user.login].mergedPRs = data.users[mergedData[i].user.login].mergedPRs + 1;
		} else {
			(data.users[mergedData[i].user.login] as unknown as UserData) = {};
			data.users[mergedData[i].user.login].mergedPRs = 1;
		}

		totalPRsMerged++;
	}

	data.totalPRsMerged = totalPRsMerged;
};
