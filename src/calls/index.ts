import { config } from 'dotenv';

import type { QueriedData, ResolvedConfig } from '../types';
import { retrieveAllClosedIssues } from './closedIssues';
import { retrievePRs } from './prs';

config();

export const retreiveAllData = async (config: ResolvedConfig) => {
	const data: QueriedData = {
		users: {},
		totalClosedIssues: 0,
		totalPRsMerged: 0,
		totalReleases: 0,
	};

	await retrieveAllClosedIssues(config, data);
	await retrievePRs(config, data);

	return data;
};
