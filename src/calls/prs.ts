import { HEADERS, USER_TEMPLATE } from '../consts';
import type { PrResponse, PrReviewResponse, QueriedData, ResolvedConfig } from '../types';
import { request } from './request';

const checkReleaseTitle = (title: string, config: ResolvedConfig): boolean => {
	if (!config.releasePattern?.length) return false;

	return config.releasePattern.some((regex) => new RegExp(regex).test(title));
};

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

const retrieveReviewedPRs = async (prNum: number, config: ResolvedConfig) => {
	const { repo, org } = config;
	return await request(`https://api.github.com/repos/${org}/${repo}/pulls/${prNum}/reviews`, {
		...HEADERS,
		method: 'GET',
	});
};

export const retrievePRs = async (config: ResolvedConfig, data: QueriedData): Promise<void> => {
	const mergedData = [];
	const pages = await getMergedPRsPaged(config);
	const startDate = new Date(config.startDate);
	let totalPRsMerged = 0;
	let totalReleases = 0;

	for await (const page of pages) {
		mergedData.push(...page.items);
	}

	const mappedReviews = mergedData.map((m) => {
		return retrieveReviewedPRs(m.number, config);
	});
	const reviewRes = (await Promise.all(mappedReviews)) as PrReviewResponse[][];

	// Finds all merged prs
	for (let i = 0; i < mergedData.length; i++) {
		if (new Date(mergedData[i].pull_request.merged_at) < startDate) break;

		if (checkReleaseTitle(mergedData[i].title, config)) {
			totalReleases++;
		}

		if (!data.users[mergedData[i].user.login]) data.users[mergedData[i].user.login] = Object.assign({}, USER_TEMPLATE);

		const prevCount = data.users[mergedData[i].user.login].mergedPRs;
		data.users[mergedData[i].user.login].mergedPRs = prevCount + 1;

		totalPRsMerged++;
	}

	// Aggregate reviews
	for (let i = 0; i < reviewRes.length; i++) {
		for (let j = 0; j < reviewRes[i].length; j++) {
			const {
				state,
				user: { login },
			} = reviewRes[i][j];

			if (!data.users[login]) data.users[login] = Object.assign({}, USER_TEMPLATE);

			if (state === 'APPROVED') {
				data.users[login].reviews.approved = data.users[login].reviews.approved + 1;
			}

			if (state === 'CHANGES_REQUESTED') {
				data.users[login].reviews.changesRequested = data.users[login].reviews.changesRequested + 1;
			}

			if (state === 'COMMENTED') {
				data.users[login].reviews.comments = data.users[login].reviews.comments + 1;
			}
		}
	}

	data.totalPRsMerged = totalPRsMerged;
	data.totalReleases = totalReleases;
};
