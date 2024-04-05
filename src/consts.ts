import { config } from 'dotenv';

config();

export const HEADERS = {
	headers: {
		'X-GitHub-Api-Version': '2022-11-28',
		Authorization: `Bearer ${process.env.API_TOKEN}`,
	},
};
export const PAGE_SIZE = 50;
