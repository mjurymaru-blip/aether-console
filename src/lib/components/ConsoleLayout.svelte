<!--
  ConsoleLayout.svelte - 司令室レイアウト
  
  NOC（ネットワークオペレーションセンター）風の固定グリッドレイアウト
-->
<script lang="ts">
	import GlitchText from './GlitchText.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		onSettingsClick?: () => void;
	}

	let { title = 'AETHER CONSOLE', subtitle = 'AI Operations Command Center', onSettingsClick, children } = $props<Props>();

	// 現在時刻（リアルタイム更新）
	let currentTime = $state(new Date());

	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('ja-JP', { hour12: false });
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
	}
</script>

<div class="console-layout">
	<!-- Top Bar -->
	<header class="console-topbar">
		<div class="topbar-left">
			<div class="system-status">
				<span class="status-dot active"></span>
				<span class="status-label">SYSTEM ONLINE</span>
			</div>
		</div>
		<div class="topbar-center">
			<GlitchText text={title} tag="h1" intensity="medium" />
			<p class="subtitle">{subtitle}</p>
		</div>
		<div class="topbar-right">
			<button class="settings-btn" onclick={() => onSettingsClick?.()}>
				⚙️
			</button>
			<div class="datetime">
				<span class="time">{formatTime(currentTime)}</span>
				<span class="date">{formatDate(currentTime)}</span>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="console-main">
		{@render children?.()}
	</main>

	<!-- Bottom Status Bar -->
	<footer class="console-statusbar">
		<div class="statusbar-section">
			<span class="label">AGENTS</span>
			<span class="value text-cyan">4 / 8</span>
		</div>
		<div class="statusbar-section">
			<span class="label">CPU</span>
			<span class="value text-green">23%</span>
		</div>
		<div class="statusbar-section">
			<span class="label">MEMORY</span>
			<span class="value text-green">1.2GB</span>
		</div>
		<div class="statusbar-section">
			<span class="label">NETWORK</span>
			<span class="value text-cyan">●</span>
		</div>
		<div class="statusbar-spacer"></div>
		<div class="statusbar-section">
			<span class="version">AETHER v0.0.1-alpha</span>
		</div>
	</footer>
</div>

<style>
	.console-layout {
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: 100vh;
		overflow: hidden;
	}

	/* Top Bar */
	.console-topbar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		background: linear-gradient(180deg, rgba(0, 255, 255, 0.05) 0%, transparent 100%);
		border-bottom: 1px solid var(--color-border);
	}

	.topbar-left {
		display: flex;
		align-items: center;
	}

	.topbar-center {
		text-align: center;
	}

	.topbar-center :global(h1) {
		font-size: 1.75rem;
		letter-spacing: 0.15em;
		margin: 0;
	}

	.subtitle {
		font-size: 0.7rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.2em;
		margin-top: var(--space-xs);
	}

	.topbar-right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--space-md);
	}

	.settings-btn {
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-xs) var(--space-sm);
		cursor: pointer;
		font-size: 1rem;
		transition: all var(--transition-fast);
	}

	.settings-btn:hover {
		border-color: var(--color-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	/* System Status */
	.system-status {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-text-dim);
	}

	.status-dot.active {
		background: var(--color-green);
		box-shadow: 0 0 10px var(--color-green);
		animation: pulse 2s infinite;
	}

	.status-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-green);
	}

	/* DateTime */
	.datetime {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-family: var(--font-mono);
	}

	.time {
		font-size: 1.25rem;
		color: var(--color-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.date {
		font-size: 0.7rem;
		color: var(--color-text-dim);
	}

	/* Main Content */
	.console-main {
		padding: var(--space-lg);
		overflow: auto;
	}

	/* Status Bar */
	.console-statusbar {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-sm) var(--space-lg);
		background: rgba(0, 255, 255, 0.02);
		border-top: 1px solid var(--color-border);
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}

	.statusbar-section {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.statusbar-section .label {
		color: var(--color-text-dim);
		text-transform: uppercase;
	}

	.statusbar-section .value {
		font-weight: 500;
	}

	.statusbar-spacer {
		flex: 1;
	}

	.version {
		color: var(--color-text-dim);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive */
	@media (max-width: 768px) {
		.console-topbar {
			grid-template-columns: 1fr;
			gap: var(--space-md);
			text-align: center;
		}

		.topbar-left, .topbar-right {
			justify-content: center;
		}

		.console-statusbar {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
