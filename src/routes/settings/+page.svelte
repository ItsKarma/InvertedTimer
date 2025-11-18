<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Settings, ArrowLeft, Upload } from 'lucide-svelte';

	// Settings state (dummy values for now)
	let backgroundColor = {
		default: '#0c6062',
		running: '#0d4b09',
		resting: '#801010'
	};
	let volume = 5;
	let warningRunning = true;
	let warningResting = false;
	let warningVolume = 5;
	let logoUrl = '';
	let showLogo = true;
	let logoSize = 'medium';
	let autoStartRest = true;
	let autoStartNextRound = true;
	let clockFormat = '12h';
	let hasLoadedSettings = false;
	let isLoading = true;

	// Auto-save settings to localStorage whenever they change (after initial load)
	$: if (browser && hasLoadedSettings) {
		localStorage.setItem('volume', volume.toString());
		localStorage.setItem('warningRunning', warningRunning.toString());
		localStorage.setItem('warningResting', warningResting.toString());
		localStorage.setItem('warningVolume', warningVolume.toString());
		localStorage.setItem('autoStartRest', autoStartRest.toString());
		localStorage.setItem('autoStartNextRound', autoStartNextRound.toString());
		localStorage.setItem('clockFormat', clockFormat);
		localStorage.setItem('logoSize', logoSize);
		localStorage.setItem('backgroundColor', JSON.stringify(backgroundColor));
		if (logoUrl) {
			localStorage.setItem('logoUrl', logoUrl);
		} else {
			localStorage.removeItem('logoUrl');
		}
	}

	onMount(() => {
		if (browser) {
			const savedVolume = localStorage.getItem('volume');
			if (savedVolume !== null) {
				volume = parseInt(savedVolume, 10);
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
				warningVolume = parseInt(savedWarningVolume, 10);
			}

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
					console.error('Failed to parse backgroundColor from localStorage:', e);
				}
			}

			hasLoadedSettings = true;
			isLoading = false;
		}
	});

	function resetSettings() {
		backgroundColor = {
			default: '#0c6062',
			running: '#0d4b09',
			resting: '#801010'
		};
		volume = 5;
		warningRunning = true;
		warningResting = false;
		warningVolume = 5;
		logoUrl = '';
		showLogo = true;
		logoSize = 'medium';
		autoStartRest = true;
		autoStartNextRound = true;
		clockFormat = '12h';
		if (browser) {
			localStorage.removeItem('volume');
			localStorage.removeItem('warningRunning');
			localStorage.removeItem('warningResting');
			localStorage.removeItem('warningVolume');
			localStorage.removeItem('autoStartRest');
			localStorage.removeItem('autoStartNextRound');
			localStorage.removeItem('clockFormat');
			localStorage.removeItem('logoUrl');
			localStorage.removeItem('showLogo');
			localStorage.removeItem('logoSize');
			localStorage.removeItem('backgroundColor');
		}
	}

	function resetSoundSettings() {
		volume = 5;
		warningRunning = true;
		warningResting = false;
		warningVolume = 5;
		if (browser) {
			localStorage.removeItem('volume');
			localStorage.removeItem('warningRunning');
			localStorage.removeItem('warningResting');
			localStorage.removeItem('warningVolume');
		}
	}

	function resetBrandingSettings() {
		logoUrl = '';
		showLogo = true;
		logoSize = 'medium';
		if (browser) {
			localStorage.removeItem('logoUrl');
			localStorage.removeItem('showLogo');
			localStorage.removeItem('logoSize');
		}
	}

	function resetThemeColors() {
		backgroundColor = {
			default: '#0c6062',
			running: '#0d4b09',
			resting: '#801010'
		};
		if (browser) {
			localStorage.removeItem('backgroundColor');
		}
	}

	function resetBehaviorSettings() {
		autoStartRest = true;
		autoStartNextRound = true;
		clockFormat = '12h';
		if (browser) {
			localStorage.removeItem('autoStartRest');
			localStorage.removeItem('autoStartNextRound');
			localStorage.removeItem('clockFormat');
		}
	}

	function handleLogoUpload(event) {
		const file = event.target.files?.[0];
		if (file) {
			// Check file size (1MB = 1048576 bytes)
			const maxSize = 1048576; // 1MB
			if (file.size > maxSize) {
				alert('File size must be under 1MB. Please choose a smaller image.');
				event.target.value = ''; // Reset file input
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				logoUrl = e.target?.result;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<svelte:head>
	<title>Settings - Inverted Timer</title>
</svelte:head>

<div class="settingsPage">
	<div class="container">
		<header>
			<a href="/" class="backButton">
				<ArrowLeft size={24} />
				Back to Timer
			</a>
			<h1><Settings size={32} /> Settings</h1>
		</header>

		{#if isLoading}
			<div class="loadingState">Loading settings...</div>
		{:else}
			<div class="settingsGrid">
				<!-- Sound Settings Section -->
				<section class="settingsSection">
					<div class="sectionHeader">
						<div>
							<h2>Sound Settings</h2>
							<p class="sectionDescription">Configure audio feedback for timer completion</p>
						</div>
						<button type="button" on:click={resetSoundSettings} class="sectionResetButton">
							Reset
						</button>
					</div>

					<div class="settingItem">
						<label for="volume">
							<span class="labelText">Volume</span>
							<span class="labelHint">{volume}</span>
						</label>
						<input type="range" id="volume" bind:value={volume} min="0" max="10" class="slider" />
					</div>

					<div class="settingItem">
						<label for="warningRunning" class="checkboxLabel">
							<input type="checkbox" id="warningRunning" bind:checked={warningRunning} />
							<span class="labelText">10-Second Warning - Work Timer</span>
							<span class="labelHint">Play knock sound during work period</span>
						</label>
					</div>

					<div class="settingItem">
						<label for="warningResting" class="checkboxLabel">
							<input type="checkbox" id="warningResting" bind:checked={warningResting} />
							<span class="labelText">10-Second Warning - Rest Timer</span>
							<span class="labelHint">Play knock sound during rest period</span>
						</label>
					</div>

					<div class="settingItem">
						<label for="warningVolume">
							<span class="labelText">Warning Volume</span>
							<span class="labelHint">{warningVolume}</span>
						</label>
						<input
							type="range"
							id="warningVolume"
							bind:value={warningVolume}
							min="0"
							max="10"
							class="slider"
						/>
					</div>
				</section>
				<!-- Branding Section -->
				<section class="settingsSection">
					<div class="sectionHeader">
						<div>
							<h2>Branding</h2>
							<p class="sectionDescription">Customize with your gym or team logo</p>
						</div>
						<button type="button" on:click={resetBrandingSettings} class="sectionResetButton">
							Reset
						</button>
					</div>
					<div class="settingItem">
						<label for="showLogo" class="checkboxLabel">
							<input type="checkbox" id="showLogo" bind:checked={showLogo} />
							<span class="labelText">Show Logo</span>
							<span class="labelHint">Display logo in top left corner</span>
						</label>
					</div>

					<div class="settingItem">
						<label for="logoSize">
							<span class="labelText">Logo Size</span>
						</label>
						<select id="logoSize" bind:value={logoSize} class="select">
							<option value="xsmall">Extra Small</option>
							<option value="small">Small</option>
							<option value="medium">Medium</option>
							<option value="large">Large</option>
							<option value="xlarge">Extra Large</option>
						</select>
					</div>

					<div class="settingItem">
						<label for="logo">
							<span class="labelText">Logo Upload</span>
							<span class="labelHint">Leave empty to use default logo</span>
							<span class="labelHint"
								>Maximum size: 1MB | Recommended: 200x200px or similar square</span
							>
						</label>
						<div class="logoUpload">
							{#if logoUrl}
								<div class="logoPreview">
									<img src={logoUrl} alt="Logo preview" />
									<button type="button" on:click={() => (logoUrl = '')} class="removeButton">
										Remove Custom Logo
									</button>
								</div>
							{:else}
								<label for="logoFile" class="uploadButton">
									<Upload size={20} />
									Upload Custom Logo
									<input
										type="file"
										id="logoFile"
										accept="image/*"
										on:change={handleLogoUpload}
										style="display: none;"
									/>
								</label>
							{/if}
						</div>
					</div>
				</section>

				<!-- Theme Colors Section -->
				<section class="settingsSection">
					<div class="sectionHeader">
						<div>
							<h2>Theme Colors</h2>
							<p class="sectionDescription">
								Customize the background colors for different timer states
							</p>
						</div>
						<button type="button" on:click={resetThemeColors} class="sectionResetButton">
							Reset
						</button>
					</div>
					<div class="settingItem">
						<label for="colorDefault">
							<span class="labelText">Default Background</span>
							<span class="labelHint">When timer is idle</span>
						</label>
						<input
							type="color"
							id="colorDefault"
							bind:value={backgroundColor.default}
							class="colorInput"
						/>
					</div>

					<div class="settingItem">
						<label for="colorRunning">
							<span class="labelText">Running Background</span>
							<span class="labelHint">During work period</span>
						</label>
						<input
							type="color"
							id="colorRunning"
							bind:value={backgroundColor.running}
							class="colorInput"
						/>
					</div>

					<div class="settingItem">
						<label for="colorResting">
							<span class="labelText">Resting Background</span>
							<span class="labelHint">During rest period</span>
						</label>
						<input
							type="color"
							id="colorResting"
							bind:value={backgroundColor.resting}
							class="colorInput"
						/>
					</div>
				</section>

				<!-- Behavior Settings Section -->
				<section class="settingsSection">
					<div class="sectionHeader">
						<div>
							<h2>Behavior</h2>
							<p class="sectionDescription">Configure timer automation and display preferences</p>
						</div>
						<button type="button" on:click={resetBehaviorSettings} class="sectionResetButton">
							Reset
						</button>
					</div>
					<div class="settingItem">
						<label for="autoStartRest" class="checkboxLabel">
							<input type="checkbox" id="autoStartRest" bind:checked={autoStartRest} />
							<span class="labelText">Auto-start Rest Timer</span>
							<span class="labelHint">Automatically begin rest period after work completes</span>
						</label>
					</div>

					<div class="settingItem">
						<label for="autoStartNextRound" class="checkboxLabel">
							<input type="checkbox" id="autoStartNextRound" bind:checked={autoStartNextRound} />
							<span class="labelText">Auto-start Next Round</span>
							<span class="labelHint">Automatically begin next work period after rest</span>
						</label>
					</div>
					<div class="settingItem">
						<label for="clockFormat">
							<span class="labelText">Clock Format</span>
						</label>
						<select id="clockFormat" bind:value={clockFormat} class="select">
							<option value="12h">12-hour</option>
							<option value="24h">24-hour</option>
							<option value="hide">Hide Clock</option>
						</select>
					</div>
				</section>
			</div>

			<!-- Action Buttons -->
			<div class="actions">
				<button type="button" on:click={resetSettings} class="resetButton">Reset to Defaults</button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.settingsPage {
		min-height: 100vh;
		background: #0c6062;
		color: white;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 3rem;
	}

	.loadingState {
		text-align: center;
		padding: 3rem;
		font-size: 1.2rem;
		opacity: 0.7;
	}

	.backButton {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: white;
		text-decoration: none;
		font-size: 1rem;
		margin-bottom: 1rem;
		transition: opacity 0.2s ease;
	}

	.backButton:hover {
		opacity: 0.8;
	}

	h1 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 2.5rem;
		margin: 0;
	}

	.settingsGrid {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.settingsSection {
		background: rgba(255, 255, 255, 0.1);
		padding: 2rem;
		border-radius: 12px;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.sectionHeader {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.sectionResetButton {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-radius: 8px;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.sectionResetButton:hover {
		opacity: 0.8;
	}

	.sectionResetButton:active {
		transform: scale(0.98);
	}

	.settingsSection h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.sectionDescription {
		margin: 0;
		opacity: 0.8;
		font-size: 0.9rem;
	}

	.settingItem {
		margin-bottom: 1.5rem;
	}

	.settingItem:last-child {
		margin-bottom: 0;
	}

	.settingItem label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.labelText {
		display: block;
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.labelHint {
		display: block;
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.colorInput {
		width: 100%;
		height: 60px;
		border: 2px solid white;
		border-radius: 8px;
		cursor: pointer;
		background: none;
	}

	.select {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 2px solid white;
		border-radius: 8px;
		cursor: pointer;
	}

	.select option {
		background: #0c6062;
		color: white;
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.2);
		outline: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		border: 2px solid #0c6062;
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		border: 2px solid #0c6062;
	}

	.checkboxLabel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkboxLabel input[type='checkbox'] {
		width: 24px;
		height: 24px;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	.logoUpload {
		margin-top: 0.5rem;
	}

	.logoPreview {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.logoPreview img {
		max-width: 200px;
		max-height: 100px;
		object-fit: contain;
		border: 2px solid white;
		border-radius: 8px;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
	}

	.uploadButton {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid white;
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	.uploadButton:hover {
		opacity: 0.8;
	}

	.uploadButton:active {
		transform: scale(0.98);
	}

	.removeButton {
		padding: 0.5rem 1rem;
		background: rgba(255, 0, 0, 0.3);
		border: 2px solid #ff4444;
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	.removeButton:hover {
		opacity: 0.8;
	}

	.removeButton:active {
		transform: scale(0.98);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 2rem 0;
	}

	.resetButton {
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: bold;
		border-radius: 8px;
		border: 2px solid white;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.resetButton:hover {
		opacity: 0.9;
		transform: translateY(-2px);
	}

	.resetButton:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.settingsPage {
			padding: 1rem 0.5rem;
		}

		.settingsSection {
			padding: 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}

		.actions {
			flex-direction: column;
		}

		.resetButton {
			width: 100%;
		}
	}
</style>
