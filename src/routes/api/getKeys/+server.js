import { createClient } from '@vercel/kv';
import { json } from '@sveltejs/kit';
import { KV_REST_API_URL, KV_REST_API_TOKEN } from '$env/static/private';

const kv = createClient({
	url: KV_REST_API_URL,
	token: KV_REST_API_TOKEN
});

export async function GET() {
	try {
		const keys = await kv.keys('*');
		// keys is an array of strings in format: date:ip-address
		// loop over the keys array and get the value for each key
		const values = await Promise.all(
			keys.map(async (key) => {
				const value = await kv.get(key);
				const [date, ip] = key.split(':');
				return { key, date, ip, rounds: value };
			})
		);

		// Calculate total rounds
		const totalRounds = values.reduce((acc, obj) => {
			return acc + parseInt(obj.rounds || 0);
		}, 0);

		// Group by date
		const byDate = values.reduce((acc, obj) => {
			if (!acc[obj.date]) acc[obj.date] = 0;
			acc[obj.date] += parseInt(obj.rounds || 0);
			return acc;
		}, {});

		// Group by IP
		const byIP = values.reduce((acc, obj) => {
			if (!acc[obj.ip]) acc[obj.ip] = 0;
			acc[obj.ip] += parseInt(obj.rounds || 0);
			return acc;
		}, {});

		return json({
			values,
			totalRounds,
			byDate,
			byIP
		});
	} catch (error) {
		console.error(`Error: ${error}`);
		return json({ error: 'Failed to fetch keys' }, { status: 500 });
	}
}
