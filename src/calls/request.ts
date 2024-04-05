export const request = async <T>(
	path: string,
	options: RequestInit = {}
): Promise<T> => {
	return fetch(path, options)
		.then((res) => {
			if (!res.ok) throw new Error(res.statusText);

			return res.json();
		})
		.then((data) => data)
		.catch((err) => {
			console.error(`Error: ${err}`);
		});
};
