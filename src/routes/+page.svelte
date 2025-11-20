<script>
	import { onMount, onDestroy } from 'svelte';
	import { PlusSquare, MinusSquare, Settings } from 'lucide-svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { browser } from '$app/environment';

	let audioRef;
	let knockAudioRef;
	let audioSrc = '/beep.mp3';
	let audioVolume = 1;
	let warningVolume = 0.5;
	let warningRunning = true;
	let warningResting = false;
	let desiredMinutes = 5;
	let desiredSeconds = 0;
	let desiredRestMinutes = 1;
	let desiredRestSeconds = 0;
	let minutes = 5;
	let seconds = 0;
	let isRunning = false;
	let isResting = false;
	let time = new Date();

	// Settings from localStorage
	let autoStartRest = true;
	let autoStartNextRound = true;
	let clockFormat = '12h';
	let logoUrl = '';
	let showLogo = true;
	let logoSize = 'medium';
	let settingsLoaded = false; // Track when localStorage settings are loaded
	let backgroundColor = {
		default: '#0c6062',
		running: '#0d4b09',
		resting: '#801010'
	};

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
			// Work period ended, check if we should auto-start rest
			if (autoStartRest) {
				minutes = desiredRestMinutes;
				seconds = desiredRestSeconds;
				isRunning = false;
				isResting = true;
			} else {
				// Stop timer if auto-start rest is disabled
				stopTimer();
			}
		} else if (isResting) {
			// Rest period ended, check if we should auto-start next round
			if (autoStartNextRound) {
				minutes = desiredMinutes;
				seconds = desiredSeconds;
				isRunning = true;
				isResting = false;
			} else {
				// Stop timer if auto-start next round is disabled
				stopTimer();
			}
		}
	}

	function handleKeydown(event) {
		// Check for Space, Arrow keys, or Page Up/Down (for wireless presenters)
		if (
			event.code === 'Space' ||
			event.code === 'ArrowRight' ||
			event.code === 'ArrowLeft' ||
			event.code === 'ArrowUp' ||
			event.code === 'ArrowDown' ||
			event.code === 'PageUp' ||
			event.code === 'PageDown'
		) {
			// Prevent default behavior (scrolling/navigation)
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

			// Play knock sound at 10 seconds
			const shouldPlayWarning = isRunning ? warningRunning : isResting ? warningResting : false;
			if (minutes === 0 && seconds === 10 && shouldPlayWarning && knockAudioRef) {
				knockAudioRef.volume = warningVolume;
				knockAudioRef.play().catch((e) => console.error('Failed to play knock audio:', e));
			}
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
			knockAudioRef = new Audio('/knock-knock-knock.mp3');

			// Load volume from localStorage
			const savedVolume = localStorage.getItem('volume');
			if (savedVolume !== null) {
				const volumeValue = parseInt(savedVolume, 10);
				// Convert from 0-10 scale to 0-1 scale (10 = max volume)
				audioVolume = volumeValue / 10;
			}

			const savedWarningRunning = localStorage.getItem('warningRunning');
			if (savedWarningRunning !== null) {
				warningRunning = savedWarningRunning === 'true';
			}

			const savedWarningResting = localStorage.getItem('warningResting');
			if (savedWarningResting !== null) {
				warningResting = savedWarningResting === 'true';
			}

			const savedWarningVolume = localStorage.getItem('warningVolume');
			if (savedWarningVolume !== null) {
				const volumeValue = parseInt(savedWarningVolume, 10);
				// Convert from 0-10 scale to 0-1 scale (10 = max volume)
				warningVolume = volumeValue / 10;
			}

			// Load behavior settings from localStorage
			const savedAutoStartRest = localStorage.getItem('autoStartRest');
			if (savedAutoStartRest !== null) {
				autoStartRest = savedAutoStartRest === 'true';
			}

			const savedAutoStartNextRound = localStorage.getItem('autoStartNextRound');
			if (savedAutoStartNextRound !== null) {
				autoStartNextRound = savedAutoStartNextRound === 'true';
			}

			const savedClockFormat = localStorage.getItem('clockFormat');
			if (savedClockFormat !== null) {
				clockFormat = savedClockFormat;
			}

			const savedLogoUrl = localStorage.getItem('logoUrl');
			if (savedLogoUrl !== null) {
				logoUrl = savedLogoUrl;
			}

			const savedShowLogo = localStorage.getItem('showLogo');
			if (savedShowLogo !== null) {
				showLogo = savedShowLogo === 'true';
			}

			const savedLogoSize = localStorage.getItem('logoSize');
			if (savedLogoSize !== null) {
				logoSize = savedLogoSize;
			}

			const savedBackgroundColor = localStorage.getItem('backgroundColor');
			if (savedBackgroundColor !== null) {
				try {
					backgroundColor = JSON.parse(savedBackgroundColor);
				} catch (e) {
					console.error('Failed to parse backgroundColor:', e);
				}
			}

			// Timer logic: update clock every second
			timeInterval = setInterval(() => {
				time = new Date();
			}, 1000);

			// Mark settings as loaded to prevent flash
			settingsLoaded = true;
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

	// Compute logo size (square dimensions)
	$: logoSizePx =
		logoSize === 'xsmall'
			? 60
			: logoSize === 'small'
				? 100
				: logoSize === 'large'
					? 180
					: logoSize === 'xlarge'
						? 240
						: 140;

	// Compute background class and color
	$: backgroundClass = isRunning ? 'running' : isResting ? 'resting' : 'default';
	$: currentBackgroundColor = isRunning
		? backgroundColor.running
		: isResting
			? backgroundColor.resting
			: backgroundColor.default;
</script>

<svelte:head>
	<title>Inverted Timer</title>
	<meta
		name="description"
		content="Round timer for martial arts training. Perfect for boxing, BJJ, MMA, and combat sports. Customizable work and rest periods with visual and audio cues between rounds."
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class={backgroundClass} style="background-color: {currentBackgroundColor}">
	<main>
		<!-- Toaster - Keep at top -->
		<Toaster position="top-right" />

		<!-- Branding Logo -->
		{#if showLogo && settingsLoaded}
			<div class="brandingLogo">
				<img
					src={logoUrl || '/inverted-gear-academy.png'}
					alt="Logo"
					class:spinning={isRunning}
					style="max-width: {logoSizePx}px; max-height: {logoSizePx}px;"
				/>
			</div>
		{/if}
		<!-- Settings Button -->
		<a href="/settings" class="settingsButton" aria-label="Settings">
			<Settings size={28} />
		</a>

		<!-- Clock -->
		{#if clockFormat !== 'hide'}
			<div class="clockContainer">
				<p>
					{#if browser}
						{time.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
							hour12: clockFormat === '12h'
						})}
					{:else}
						<span class="clock-placeholder">{clockFormat === '12h' ? '00:00 AM' : '00:00'}</span>
					{/if}
				</p>
			</div>
		{/if}

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

	.brandingLogo {
		position: fixed;
		top: 1.5rem;
		left: 1.5rem;
		z-index: 100;
	}

	.brandingLogo img {
		max-width: 150px;
		max-height: 80px;
		object-fit: contain;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.brandingLogo img.spinning {
		animation: spin 5s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.settingsButton {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		color: white;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid white;
		border-radius: 50%;
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
		z-index: 100;
	}

	.settingsButton:hover {
		opacity: 0.8;
		transform: scale(1.05);
	}

	.settingsButton:active {
		transform: scale(0.95);
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
