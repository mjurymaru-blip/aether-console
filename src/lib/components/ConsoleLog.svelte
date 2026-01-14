<!--
  ConsoleLog.svelte - コンソール出力表示
  
  リアルタイムログ表示用コンポーネント
-->
<script lang="ts">
	interface LogEntry {
		timestamp: string;
		level: 'info' | 'success' | 'warning' | 'error' | 'debug';
		source?: string;
		message: string;
	}

	interface Props {
		logs: LogEntry[];
		maxHeight?: string;
		autoScroll?: boolean;
	}

	let { logs, maxHeight = '300px', autoScroll = true } = $props<Props>();

	const levelColors: Record<string, string> = {
		info: 'var(--color-text-dim)',
		success: 'var(--color-green)',
		warning: 'var(--color-orange)',
		error: 'var(--color-red)',
		debug: 'var(--color-blue)'
	};

	const levelIcons: Record<string, string> = {
		info: '○',
		success: '●',
		warning: '◐',
		error: '◉',
		debug: '◇'
	};
</script>

<div class="console-log" style="max-height: {maxHeight}">
	{#each logs as log}
		<div class="log-entry" style="--level-color: {levelColors[log.level]}">
			<span class="log-icon">{levelIcons[log.level]}</span>
			<span class="log-timestamp">[{log.timestamp}]</span>
			{#if log.source}
				<span class="log-source">{log.source}</span>
			{/if}
			<span class="log-message">{log.message}</span>
		</div>
	{/each}
</div>

<style>
	.console-log {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.6;
		overflow-y: auto;
		background: rgba(0, 0, 0, 0.3);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
	}

	.log-entry {
		display: flex;
		gap: var(--space-sm);
		padding: 2px 0;
		color: var(--level-color);
	}

	.log-entry:hover {
		background: rgba(0, 255, 255, 0.05);
	}

	.log-icon {
		flex-shrink: 0;
		width: 1em;
		text-align: center;
	}

	.log-timestamp {
		flex-shrink: 0;
		color: var(--color-text-dim);
	}

	.log-source {
		flex-shrink: 0;
		color: var(--color-cyan);
	}

	.log-source::after {
		content: ':';
	}

	.log-message {
		flex: 1;
		word-break: break-word;
	}
</style>
