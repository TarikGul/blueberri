import yargs from 'yargs';

import packageJSON from '../package.json';

export type ArgsType = {
	[x: string]: unknown;
	o?: string;
	r?: string;
	s?: string;
	e?: string;
	w?: string;
	c?: string;
	_: (string | number)[];
	$0: string;
};

export const argv = async (): Promise<ArgsType> => {
	return await yargs.version(packageJSON.version).options({
		o: {
			alias: 'org',
			description: 'The org that owns the repository',
			type: 'string',
			demandOption: false,
		},
		r: {
			alias: 'repo',
			description: 'The repository to query',
			type: 'string',
			demandOption: false,
		},
		s: {
			alias: 'start-date',
			description: 'Expects a date in ISO format',
			type: 'string',
			demandOption: false,
		},
		e: {
			alias: 'end-date',
			description: 'Expects a date in ISO format',
			type: 'string',
			demandOption: false,
		},
		w: {
			alias: 'write',
			description: 'Path to write the data too',
			type: 'string',
			demandOption: false,
		},
		c: {
			alias: 'config',
			description: 'Path to config. Relative to where the script it called.',
			type: 'string',
			demandOption: false,
		},
	}).argv;
};
