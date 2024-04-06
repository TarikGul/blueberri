import { USER_TEMPLATE } from '../consts';

export const createUserTemplate = () => {
	return Object.assign({}, USER_TEMPLATE, {
		reviews: {
			approved: 0,
			changesRequested: 0,
			comments: 0,
		},
	});
};
