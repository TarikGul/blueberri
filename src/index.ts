import type { ConfigJSON } from './types';

import fs from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';

import { ArgsType, argv } from './cli';
import { retreiveAllData } from './calls/index';

const parseDate = (d: string): string => {
    try {
        return new Date(d).toISOString();
    } catch (e) {
        console.error(e);
        process.exit(1);
    };
}

/**
 * Takes in the CLI options and blueberri.config.json.
 * Note: If options are presnt in both, the CLI input will override the config
 * @param args 
 */
const resolveConfig = (args: ArgsType) => {
    const pathToConfig = args.c || path.dirname(__filename) + '/../../blueberri.config.json';
    const load = fs.existsSync(pathToConfig)
        ? require('./blueberry.config.json') as ConfigJSON
        : null;
    if (!load) console.warn('No blueberry.config.json detected');

    // Required
    const org = args.o || load?.org;
    const repo = args.r || load?.repo;
    const startDate = args.s && parseDate(args.s) || load?.startDate && parseDate(load?.startDate);
    assert(org, 'Org arg is required!');
    assert(repo, 'Repo arg is required!');
    assert(startDate, 'Start date is required!');

    // Not required
    const endDate = args.e && parseDate(args.e) || load?.endDate && parseDate(load?.endDate);
    const writeTo = args.w || load?.writeTo;
    
    return {
        org,
        repo,
        startDate,
        endDate,
        writeTo
    }
}

const main = async () => {
    const args = await argv();
    const config = resolveConfig(args);
    const data = await retreiveAllData(config);

    console.log(data);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1)
    })
    .finally(() => process.exit(0))
