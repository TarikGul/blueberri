import { Octokit } from 'octokit';

import type { QueriedData, ResolvedConfig } from '../types';
import { retrieveAllClosedIssues } from './closedIssues';

export const retreiveAllData = async (config: ResolvedConfig) => {
	const data: QueriedData = { users: {}, totalClosedIssues: 0 };
	const api = new Octokit({ auth: process.env.API_TOKEN });

	await retrieveAllClosedIssues(api, config, data);

	return data;
};
