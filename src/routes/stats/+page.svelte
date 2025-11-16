<script>
	import { onMount } from 'svelte';

	let data = [];
	let loading = true;
	let error = null;

	let totalRounds = 0;
	let byDate = {};
	let byIP = {};

	async function fetchKeys() {
		try {
			loading = true;
			const response = await fetch('/api/getKeys', {
				method: 'GET'
			});
			const resJson = await response.json();

			if (resJson.values && Array.isArray(resJson.values)) {
				data = resJson.values;
				totalRounds = resJson.totalRounds || 0;
				byDate = resJson.byDate || {};
				byIP = resJson.byIP || {};
			} else {
				console.error('Error: Response is not valid');
				console.error(resJson);
				error = 'Invalid response format';
			}
		} catch (err) {
			console.error('Error:', err);
			error = 'Failed to fetch statistics';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchKeys();
	});
</script>

<svelte:head>
	<title>Stats</title>
	<meta name="description" content="Statistics Page" />
</svelte:head>

<div class="container">
	<main class="main">
		{#if loading}
			<p>Loading...</p>
		{:else if error}
			<p class="error">{error}</p>
		{:else}
			<div class="stats-header">
				<h2>Total Rounds: {totalRounds}</h2>
			</div>

			<div class="stats-grid">
				<div class="stats-section">
					<h3>Rounds by Date</h3>
					<ul>
						{#if Object.keys(byDate).length === 0}
							<li>No data found</li>
						{/if}
						{#each Object.entries(byDate).sort( (a, b) => b[0].localeCompare(a[0]) ) as [date, rounds]}
							<li>
								<strong>{date}</strong>: {rounds} rounds
							</li>
						{/each}
					</ul>
				</div>

				<div class="stats-section">
					<h3>Rounds by IP Address</h3>
					<ul>
						{#if Object.keys(byIP).length === 0}
							<li>No data found</li>
						{/if}
						{#each Object.entries(byIP).sort((a, b) => b[1] - a[1]) as [ip, rounds]}
							<li>
								<strong>{ip}</strong>: {rounds} rounds
							</li>
						{/each}
					</ul>
				</div>

				<div class="stats-section">
					<h3>Detailed Data (Date : IP)</h3>
					<ul>
						{#if data.length === 0}
							<li>No data found</li>
						{/if}
						{#each data.sort((a, b) => b.date.localeCompare(a.date)) as item}
							<li>
								<strong>{item.date}</strong> : <strong>{item.ip}</strong> - {item.rounds} rounds
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.container {
		min-height: 100vh;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.main {
		padding: 2rem 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		width: 100%;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 2rem 0;
	}

	li {
		padding: 0.5rem 0;
		font-size: 1.2rem;
	}

	.error {
		color: #eb3b53;
		font-weight: bold;
	}

	.stats-header {
		margin: 2rem 0;
		width: 100%;
		text-align: center;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 1400px;
		align-items: start;
	}

	.stats-section {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h2 {
		font-size: 2rem;
		margin: 1rem 0;
	}

	h3 {
		font-size: 1.5rem;
		margin: 0 0 1rem 0;
		border-bottom: 2px solid #ccc;
		padding-bottom: 0.5rem;
	}

	ul {
		max-height: 600px;
		overflow-y: auto;
	}
</style>
