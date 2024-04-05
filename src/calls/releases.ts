import { HEADERS, PAGE_SIZE } from '../consts';
import type { QueriedData, ResolvedConfig } from '../types';
import { request } from './request';

async function* getReleasePaged(config: ResolvedConfig) {
	let page = 1;
	let isDone = false;

	while (!isDone) {
		const res = await getReleasePage(page, config);

		yield res;

		const len = res.length;
		const lastEntryDate = new Date(res[len - 1].created_at);
		if (lastEntryDate < new Date(config.startDate)) {
			isDone = true;
		} else {
			++page;
		}
	}
}

const getReleasePage = async (page: number, config: ResolvedConfig): Promise<{ created_at: string }[]> => {
	const { repo, org } = config;
	return await request(`https://api.github.com/repos/${org}/${repo}/releases?page=${page}&per_page=${PAGE_SIZE}`, {
		...HEADERS,
		method: 'GET',
	});
};

export const retrieveAllReleases = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const concatData: { created_at: string }[] = [];
	const pages = await getReleasePaged(config);
	const startDate = new Date(config.startDate);
	let totalCount = 0;

	for await (const page of pages) {
		concatData.push(...page);
	}

	for (let i = 0; i < concatData.length; i++) {
		if (new Date(concatData[i].created_at) < startDate) break;

		totalCount++;
	}

	data.totalReleases = totalCount;
};
