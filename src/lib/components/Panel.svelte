<!--
  Panel.svelte - SF風パネルコンポーネント
  
  Usage:
    <Panel title="SYSTEM STATUS">
      コンテンツ
    </Panel>
-->
<script lang="ts">
	interface Props {
		title?: string;
		variant?: 'default' | 'corner' | 'minimal';
		glow?: boolean;
	}

	let { title, variant = 'corner', glow = false, children } = $props<Props>();
</script>

<div 
	class="panel" 
	class:panel-corner={variant === 'corner'}
	class:panel-minimal={variant === 'minimal'}
	class:glow-box={glow}
>
	{#if title}
		<div class="panel-header">
			<span class="panel-title">{title}</span>
			<div class="panel-decoration"></div>
		</div>
	{/if}
	<div class="panel-content">
		{@render children?.()}
	</div>
</div>

<style>
	.panel {
		background: var(--color-bg-panel);
		border: 1px solid var(--color-border);
		position: relative;
		backdrop-filter: blur(10px);
		transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
	}

	.panel:hover {
		border-color: var(--color-border-bright);
	}

	.panel-corner {
		clip-path: polygon(
			0 12px,
			12px 0,
			100% 0,
			100% calc(100% - 12px),
			calc(100% - 12px) 100%,
			0 100%
		);
	}

	.panel-minimal {
		background: transparent;
		border: none;
		border-left: 2px solid var(--color-cyan);
		padding-left: var(--space-md);
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid var(--color-border);
		background: rgba(0, 255, 255, 0.05);
	}

	.panel-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.panel-decoration {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--color-border-bright), transparent);
	}

	.panel-content {
		padding: var(--space-md);
	}

	.glow-box {
		box-shadow: var(--glow-cyan);
	}
</style>
