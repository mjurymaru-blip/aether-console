<!--
  ScenarioPlayer.svelte - シナリオ再生コントローラー
-->
<script lang="ts">
	import { simulationStore } from '$lib/stores/simulation';
	import { basicAnalysisFlow } from '$lib/data/scenarios';
	import { onMount } from 'svelte';

	// シナリオをロード
	onMount(() => {
		simulationStore.loadScenario(basicAnalysisFlow);
	});

	// 再生状態
	let state = $derived($simulationStore);
	
	// 進行率
	let progress = $derived(
		state.scenario ? (state.currentTime / state.scenario.duration) * 100 : 0
	);

	// 時間フォーマット
	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}

	function handlePlay() {
		if (state.isPaused) {
			simulationStore.resume();
		} else {
			simulationStore.play();
		}
	}

	function handlePause() {
		simulationStore.pause();
	}

	function handleReset() {
		simulationStore.reset();
	}

	function handleSpeedChange(speed: number) {
		simulationStore.setSpeed(speed);
	}
</script>

<div class="scenario-player">
	<div class="player-header">
		<span class="scenario-name">{state.scenario?.name || 'シナリオ未選択'}</span>
		<span class="scenario-desc">{state.scenario?.description || ''}</span>
	</div>

	<div class="player-controls">
		<div class="control-buttons">
			{#if !state.isPlaying || state.isPaused}
				<button class="btn play" onclick={handlePlay} disabled={!state.scenario}>
					▶
				</button>
			{:else}
				<button class="btn pause" onclick={handlePause}>
					⏸
				</button>
			{/if}
			<button class="btn reset" onclick={handleReset} disabled={state.currentTime === 0}>
				⏹
			</button>
		</div>

		<div class="progress-section">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progress}%"></div>
				<div class="progress-marker" style="left: {progress}%"></div>
			</div>
			<div class="time-display">
				<span class="current-time">{formatTime(state.currentTime)}</span>
				<span class="separator">/</span>
				<span class="total-time">{formatTime(state.scenario?.duration || 0)}</span>
			</div>
		</div>

		<div class="speed-controls">
			<span class="speed-label">Speed:</span>
			{#each [0.5, 1, 2, 4] as speed}
				<button 
					class="speed-btn" 
					class:active={state.playbackSpeed === speed}
					onclick={() => handleSpeedChange(speed)}
				>
					{speed}x
				</button>
			{/each}
		</div>
	</div>

	<div class="player-status">
		{#if state.isPlaying && !state.isPaused}
			<span class="status-dot playing"></span>
			<span class="status-text">再生中</span>
		{:else if state.isPaused}
			<span class="status-dot paused"></span>
			<span class="status-text">一時停止</span>
		{:else if state.currentTime > 0}
			<span class="status-dot stopped"></span>
			<span class="status-text">停止</span>
		{:else}
			<span class="status-dot ready"></span>
			<span class="status-text">待機中</span>
		{/if}
	</div>
</div>

<style>
	.scenario-player {
		background: var(--color-bg-panel);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.player-header {
		margin-bottom: var(--space-md);
	}

	.scenario-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-cyan);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.scenario-desc {
		display: block;
		font-size: 0.7rem;
		color: var(--color-text-dim);
		margin-top: var(--space-xs);
	}

	.player-controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.control-buttons {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		width: 36px;
		height: 36px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 1rem;
		transition: all var(--transition-fast);
	}

	.btn:hover:not(:disabled) {
		border-color: var(--color-cyan);
		color: var(--color-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn.play:hover:not(:disabled) {
		border-color: var(--color-green);
		color: var(--color-green);
		box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
	}

	.progress-section {
		flex: 1;
		min-width: 200px;
	}

	.progress-bar {
		height: 6px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		position: relative;
		overflow: visible;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyan), var(--color-blue));
		border-radius: var(--radius-sm);
		transition: width 0.1s linear;
	}

	.progress-marker {
		position: absolute;
		top: 50%;
		width: 12px;
		height: 12px;
		background: var(--color-cyan);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 10px var(--color-cyan);
	}

	.time-display {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-xs);
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}

	.current-time {
		color: var(--color-cyan);
	}

	.separator {
		color: var(--color-text-dim);
	}

	.total-time {
		color: var(--color-text-dim);
	}

	.speed-controls {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.speed-label {
		font-size: 0.7rem;
		color: var(--color-text-dim);
	}

	.speed-btn {
		padding: 4px 8px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-dim);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 0.65rem;
		font-family: var(--font-mono);
		transition: all var(--transition-fast);
	}

	.speed-btn:hover {
		border-color: var(--color-cyan);
		color: var(--color-cyan);
	}

	.speed-btn.active {
		border-color: var(--color-cyan);
		background: rgba(0, 255, 255, 0.1);
		color: var(--color-cyan);
	}

	.player-status {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.status-dot.playing {
		background: var(--color-green);
		box-shadow: 0 0 10px var(--color-green);
		animation: pulse 1s infinite;
	}

	.status-dot.paused {
		background: var(--color-orange);
		box-shadow: 0 0 10px var(--color-orange);
	}

	.status-dot.stopped {
		background: var(--color-red);
	}

	.status-dot.ready {
		background: var(--color-text-dim);
	}

	.status-text {
		font-size: 0.7rem;
		color: var(--color-text-dim);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
