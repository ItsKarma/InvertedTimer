import { createClient } from '@vercel/kv';
import { json } from '@sveltejs/kit';
import { KV_REST_API_URL, KV_REST_API_TOKEN } from '$env/static/private';

const kv = createClient({
	url: KV_REST_API_URL,
	token: KV_REST_API_TOKEN
});

export async function POST({ request, getClientAddress }) {
	try {
		const date = new Date().toISOString().split('T')[0];
		const ipAddress = getClientAddress();
		const key = `${date}:${ipAddress}`;

		await kv.incr(key);
		return json({ message: 'Session incremented successfully', key });
	} catch (error) {
		console.error(`Error: ${error}`);
		return json({ error: 'Failed to increment session' }, { status: 500 });
	}
}
