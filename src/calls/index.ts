import type { QueriedData, ResolvedConfig } from '../types';
import { retrieveAllClosedIssues } from './closedIssues';
import { retrieveAllOpenedIssues } from './openedIssues';
import { retrievePRs } from './prs';
import { retrieveAllReleases } from './releases';

export const retreiveAllData = async (config: ResolvedConfig) => {
	const data: QueriedData = {
		users: {},
		totalClosedIssues: 0,
		totalPRsMerged: 0,
		totalReleases: 0,
		totalOpenedIssues: 0,
	};

	await retrieveAllOpenedIssues(config, data);
	await retrieveAllClosedIssues(config, data);
	await retrieveAllReleases(config, data);
	await retrievePRs(config, data);

	return data;
};
