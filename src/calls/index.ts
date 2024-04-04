import type { ResolvedConfig, QueriedData } from '../types';

import { Octokit } from "octokit";
import { retrieveAllClosedIssues } from './closedIssues';

export const retreiveAllData = async (config: ResolvedConfig) => {
    const data: QueriedData = {};
    const api = new Octokit({ auth: process.env.API_TOKEN });

    await retrieveAllClosedIssues(api, config, data);

    return data;
}
