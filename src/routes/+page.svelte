<script>
	import { onMount, onDestroy } from 'svelte';
	import { PlusSquare, MinusSquare } from 'lucide-svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { browser } from '$app/environment';

	let audioRef;
	let audioSrc = '/beepLoud.mp3';
	let audioVolume = 1;
	let desiredMinutes = 5;
	let desiredSeconds = 0;
	let desiredRestMinutes = 1;
	let desiredRestSeconds = 0;
	let minutes = 5;
	let seconds = 0;
	let isRunning = false;
	let isResting = false;
	let time = new Date();

	async function incrementRounds() {
		try {
			await fetch('/api/incrementRounds', {
				method: 'POST'
			});
		} catch (error) {
			console.error('Error:', error);
		}
	}

	function startTimer() {
		isResting = false;
		isRunning = true;
		minutes = desiredMinutes;
		seconds = desiredSeconds;
	}

	function stopTimer() {
		isRunning = false;
		isResting = false;
		minutes = desiredMinutes;
		seconds = desiredSeconds;
	}

	function toggleRunningResting() {
		if (isRunning) {
			minutes = desiredRestMinutes;
			seconds = desiredRestSeconds;
			isRunning = false;
			isResting = true;
		} else if (isResting) {
			minutes = desiredMinutes;
			seconds = desiredSeconds;
			isRunning = true;
			isResting = false;
		}
	}

	function handleKeydown(event) {
		if (event.code === 'Space') {
			// Prevent default spacebar behavior (scrolling the page)
			event.preventDefault();

			// Don't trigger if user is typing in an input/textarea
			const target = event.target;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			if (isRunning || isResting) {
				stopTimer();
			} else {
				startTimer();
			}
		}
	}

	let timerInterval;
	let timeInterval;

	function tick() {
		if (minutes === 0 && seconds === 0) {
			toggleRunningResting();
			return;
		}

		// Check if we need to decrement the timer
		if (minutes !== 0 && seconds === 0) {
			// Rolling down the minutes and setting seconds to 59
			seconds = 59;
			minutes = minutes - 1;
		} else if (seconds !== 0) {
			// Decrementing seconds
			seconds = seconds - 1;
		} else {
			console.error(`Error: Timer Logic: ${minutes}:${seconds}`);
			toast.error(`Error: Timer Logic: ${minutes}:${seconds}`, {
				duration: 10000
			});
		}

		// Check if the timer just hit 0:00
		if (minutes === 0 && seconds === 0) {
			// Play audio
			if (audioRef) {
				audioRef.volume = audioVolume;
				audioRef.src = audioSrc;
				audioRef.play().catch((error) => {
					console.warn('Audio playback failed:', error);
					// Fallback: visual notification via toast
					toast('Timer Complete!', { duration: 3000 });
				});
			} else {
				console.error('Audio Error');
				toast.error('Audio Error', { duration: 10000 });
			}
			// Increment rounds
			if (isRunning) {
				incrementRounds();
			}
		}
	}

	// Reactive statement: start/stop timer interval based on state
	$: if (browser) {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		if (isRunning || isResting) {
			timerInterval = setInterval(tick, 1000);
		}
	}

	onMount(() => {
		if (browser) {
			audioRef = new Audio();

			// Timer logic: update clock every second
			timeInterval = setInterval(() => {
				time = new Date();
			}, 1000);
		}
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
		if (timeInterval) clearInterval(timeInterval);
	});

	// Format time with leading zeros
	function formatTime(value) {
		return value < 10 ? `0${value}` : value;
	}

	// Compute background class
	$: backgroundClass = isRunning ? 'running' : isResting ? 'resting' : 'default';
</script>

<svelte:head>
	<title>Inverted Timer</title>
	<meta
		name="description"
		content="Round timer for martial arts training. Perfect for boxing, BJJ, MMA, and combat sports. Customizable work and rest periods with visual and audio cues between rounds."
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class={backgroundClass}>
	<main>
		<!-- Toaster - Keep at top -->
		<Toaster position="top-right" />

		<!-- Clock -->
		<div class="clockContainer">
			<p>
				{#if browser}
					{time.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
						hour12: true
					})}
				{:else}
					<span class="clock-placeholder">00:00 AM</span>
				{/if}
			</p>
		</div>

		<!-- Timer -->
		<div class="timerContainer">
			{#if !isRunning && !isResting}
				<div class="iconButtonWrapper">
					<button
						class="iconButton"
						aria-label="Increase minutes"
						on:click={() => {
							desiredMinutes = desiredMinutes + 1;
							minutes = desiredMinutes;
						}}
					>
						<PlusSquare size={48} />
					</button>
					<button
						class="iconButton"
						aria-label="Decrease minutes"
						on:click={() => {
							if (desiredMinutes > 0) {
								desiredMinutes = desiredMinutes - 1;
								minutes = desiredMinutes;
							}
						}}
						disabled={desiredMinutes === 0}
					>
						<MinusSquare size={48} />
					</button>
				</div>
			{/if}
			<div>
				<h1 class="timer">
					{formatTime(minutes)}:{formatTime(seconds)}
				</h1>
			</div>
			{#if !isRunning && !isResting}
				<div class="iconButtonWrapper">
					<button
						class="iconButton"
						aria-label="Increase seconds by 5"
						on:click={() => {
							const newSeconds = (desiredSeconds + 5) % 60;
							desiredSeconds = newSeconds;
							seconds = newSeconds;
						}}
					>
						<PlusSquare size={48} />
					</button>
					<button
						class="iconButton"
						aria-label="Decrease seconds by 5"
						on:click={() => {
							const newSeconds = desiredSeconds === 0 ? 55 : desiredSeconds - 5;
							desiredSeconds = newSeconds;
							seconds = newSeconds;
						}}
					>
						<MinusSquare size={48} />
					</button>
				</div>
			{/if}
		</div>

		<!-- Start/Stop -->
		<div class="controls">
			{#if !isRunning && !isResting}
				<button on:click={startTimer} class="startButton">Start</button>
			{/if}
			{#if isRunning || isResting}
				<button on:click={stopTimer} class="stopButton">Stop</button>
			{/if}
		</div>

		<!-- Small Rest Timer -->
		<div>
			{#if !isRunning && !isResting}
				<div class="timerSmallPlaceholder">
					<div class="timerSmallContainer">
						<div class="iconButtonWrapper">
							<button
								class="iconButtonSmall"
								on:click={() => {
									desiredRestMinutes = desiredRestMinutes + 1;
								}}
							>
								<PlusSquare size={24} />
							</button>
							<button
								class="iconButtonSmall"
								on:click={() => {
									if (desiredRestMinutes > 0) {
										desiredRestMinutes = desiredRestMinutes - 1;
									}
								}}
								disabled={desiredRestMinutes === 0}
							>
								<MinusSquare size={24} />
							</button>
						</div>
						<div>
							<h1 class="timerSmall">
								{formatTime(desiredRestMinutes)}:{formatTime(desiredRestSeconds)}
							</h1>
						</div>
						<div class="iconButtonWrapper">
							<button
								class="iconButtonSmall"
								on:click={() => {
									const newRestSeconds = (desiredRestSeconds + 5) % 60;
									desiredRestSeconds = newRestSeconds;
								}}
							>
								<PlusSquare size={24} />
							</button>
							<button
								class="iconButtonSmall"
								on:click={() => {
									const newRestSeconds = desiredRestSeconds === 0 ? 55 : desiredRestSeconds - 5;
									desiredRestSeconds = newRestSeconds;
								}}
							>
								<MinusSquare size={24} />
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="controlsPlaceholder"></div>
			{/if}
		</div>
	</main>
</div>

<style>
	.running {
		min-height: 100vh;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		background: rgb(13, 75, 9);
	}

	.resting {
		min-height: 100vh;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		background: rgb(128, 16, 16);
	}

	.default {
		min-height: 100vh;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		background: rgb(12, 96, 98);
	}

	.clockContainer {
		margin-top: -12vw;
		margin-bottom: -12vw;
		font-size: 12vw;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.clock-placeholder {
		opacity: 0;
	}

	.timerContainer {
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.timerSmallContainer {
		height: 5vw;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.timerSmallPlaceholder p {
		font-size: 2vw;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.timerSmallPlaceholder {
		height: 5vw;
		width: 100%;
	}

	.timer {
		margin: 0;
		font-size: 25vw;
		color: white;
		font-family: Courier, 'Courier New', 'Lucida Sans Typewriter', monospace;
	}

	.timerSmall {
		margin: 0;
		font-size: 4vw;
		color: white;
		font-family: Courier, 'Courier New', 'Lucida Sans Typewriter', monospace;
	}

	.iconButtonWrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.iconButton {
		margin: 0.25rem 1vw;
		padding: 0.25rem 0.25rem;
		font-size: 2.5vw;
		background: none;
		color: white;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	.iconButton:hover:not(:disabled) {
		opacity: 0.8;
	}

	.iconButton:active:not(:disabled) {
		transform: scale(0.95);
	}

	.iconButton:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.iconButtonSmall {
		margin: 0 0.5vw;
		padding: 0.25rem 0.25rem;
		font-size: 1.5vw;
		background: none;
		color: white;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	.iconButtonSmall:hover:not(:disabled) {
		opacity: 0.8;
	}

	.iconButtonSmall:active:not(:disabled) {
		transform: scale(0.95);
	}

	.iconButtonSmall:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.controlsPlaceholder {
		height: 5rem;
		width: 100%;
	}

	.startButton {
		margin: 0vw 0vw;
		padding: 1vw 5vw;
		font-size: 2.5vw;
		font-weight: bold;
		color: white;
		background-color: #0f5aa8;
		border: 3px solid white;
		border-radius: 1vw;
		cursor: pointer;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.1s ease,
			box-shadow 0.2s ease;
	}

	.startButton:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	.startButton:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.stopButton {
		margin: 0vw 0vw;
		padding: 1vw 5vw;
		font-size: 2.5vw;
		font-weight: bold;
		color: white;
		background-color: #a81f33;
		border: 3px solid white;
		border-radius: 1vw;
		cursor: pointer;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.1s ease,
			box-shadow 0.2s ease;
	}

	.stopButton:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	.stopButton:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
</style>
