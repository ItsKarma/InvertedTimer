export const prerender = true;

export async function load({ fetch }) {
	try {
		const response = await fetch('/api/getKeys', {
			method: 'GET'
		});
		const resJson = await response.json();

		if (resJson.values && Array.isArray(resJson.values)) {
			return {
				data: resJson.values,
				totalRounds: resJson.totalRounds || 0,
				byDate: resJson.byDate || {},
				byIP: resJson.byIP || {}
			};
		} else {
			console.error('Error: Response is not valid');
			console.error(resJson);
			return {
				error: 'Invalid response format'
			};
		}
	} catch (err) {
		console.error('Error:', err);
		return {
			error: 'Failed to fetch statistics'
		};
	}
}
