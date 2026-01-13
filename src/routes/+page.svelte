<script lang="ts">
	import Panel from '$lib/components/Panel.svelte';
	import GlitchText from '$lib/components/GlitchText.svelte';
	import StatusIndicator from '$lib/components/StatusIndicator.svelte';
</script>

<div class="console-container">
	<!-- Header -->
	<header class="console-header">
		<GlitchText text="AETHER CONSOLE" tag="h1" intensity="high" />
		<p class="subtitle">AI Operations Command Center</p>
	</header>

	<!-- Main Grid -->
	<main class="console-grid">
		<!-- Agent Status Panel -->
		<Panel title="AGENT STATUS">
			<div class="agent-list">
				<div class="agent-item">
					<StatusIndicator status="active" label="Analyzer" size="md" />
				</div>
				<div class="agent-item">
					<StatusIndicator status="idle" label="Predictor" size="md" />
				</div>
				<div class="agent-item">
					<StatusIndicator status="warning" label="Monitor" size="md" />
				</div>
				<div class="agent-item">
					<StatusIndicator status="offline" label="Planner" size="md" />
				</div>
			</div>
		</Panel>

		<!-- System Info Panel -->
		<Panel title="SYSTEM INFO" variant="corner" glow={true}>
			<div class="system-info">
				<div class="info-row">
					<span class="info-label">VERSION</span>
					<span class="info-value font-mono">0.0.1-alpha</span>
				</div>
				<div class="info-row">
					<span class="info-label">UPTIME</span>
					<span class="info-value font-mono text-green">00:14:32</span>
				</div>
				<div class="info-row">
					<span class="info-label">AGENTS</span>
					<span class="info-value font-mono text-cyan">4 / 8</span>
				</div>
			</div>
		</Panel>

		<!-- Message Panel -->
		<Panel title="CONSOLE OUTPUT" variant="minimal">
			<div class="console-output font-mono">
				<p class="text-dim">[00:00:01] System initialized</p>
				<p class="text-green">[00:00:02] Analyzer agent online</p>
				<p class="text-cyan">[00:00:03] Connecting to Spec-Flow Studio...</p>
				<p class="text-orange">[00:00:05] Warning: Monitor agent unstable</p>
				<p class="text-dim">[00:00:08] Waiting for input...</p>
			</div>
		</Panel>

		<!-- Design System Preview -->
		<Panel title="DESIGN TOKENS">
			<div class="color-swatches">
				<div class="swatch" style="background: var(--color-cyan)">
					<span>Cyan</span>
				</div>
				<div class="swatch" style="background: var(--color-blue)">
					<span>Blue</span>
				</div>
				<div class="swatch" style="background: var(--color-green)">
					<span>Green</span>
				</div>
				<div class="swatch" style="background: var(--color-orange)">
					<span>Orange</span>
				</div>
				<div class="swatch" style="background: var(--color-red)">
					<span>Red</span>
				</div>
			</div>
		</Panel>
	</main>

	<!-- Footer -->
	<footer class="console-footer">
		<span class="text-dim font-mono">AETHER CONSOLE v0.0.1</span>
		<span class="text-cyan">●</span>
		<span class="text-dim font-mono">SvelteKit + PWA</span>
	</footer>
</div>

<style>
	.console-container {
		min-height: 100vh;
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	/* Header */
	.console-header {
		text-align: center;
		padding: var(--space-xl) 0;
	}

	.console-header :global(h1) {
		font-size: 3rem;
		letter-spacing: 0.2em;
		margin-bottom: var(--space-sm);
	}

	.subtitle {
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.3em;
		font-size: 0.875rem;
	}

	/* Main Grid */
	.console-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-lg);
		flex: 1;
	}

	/* Agent List */
	.agent-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.agent-item {
		padding: var(--space-sm) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.agent-item:last-child {
		border-bottom: none;
	}

	/* System Info */
	.system-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.info-value {
		font-size: 0.875rem;
	}

	/* Console Output */
	.console-output {
		font-size: 0.8rem;
		line-height: 1.8;
	}

	.console-output p {
		margin: 0;
	}

	/* Color Swatches */
	.color-swatches {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.swatch {
		width: 60px;
		height: 60px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: var(--space-xs);
		box-shadow: 0 0 10px currentColor;
	}

	.swatch span {
		font-size: 0.6rem;
		text-transform: uppercase;
		color: var(--color-bg-primary);
		font-weight: 600;
	}

	/* Footer */
	.console-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) 0;
		border-top: 1px solid var(--color-border);
		font-size: 0.75rem;
	}
</style>
