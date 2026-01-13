<!--
  StatusIndicator.svelte - ステータスインジケーター
  
  Usage:
    <StatusIndicator status="active" label="AI Agent" />
-->
<script lang="ts">
	interface Props {
		status: 'active' | 'idle' | 'warning' | 'error' | 'offline';
		label?: string;
		pulse?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, label, pulse = true, size = 'md' } = $props<Props>();

	const statusColors: Record<string, string> = {
		active: 'var(--color-green)',
		idle: 'var(--color-cyan)',
		warning: 'var(--color-orange)',
		error: 'var(--color-red)',
		offline: 'var(--color-text-dim)'
	};

	const statusLabels: Record<string, string> = {
		active: 'ACTIVE',
		idle: 'IDLE',
		warning: 'WARNING',
		error: 'ERROR',
		offline: 'OFFLINE'
	};
</script>

<div class="status-indicator" class:size-sm={size === 'sm'} class:size-lg={size === 'lg'}>
	<div 
		class="status-dot" 
		class:pulse={pulse && status !== 'offline'}
		style="--status-color: {statusColors[status]}"
	></div>
	{#if label}
		<span class="status-label">{label}</span>
		<span class="status-text" style="color: {statusColors[status]}">{statusLabels[status]}</span>
	{/if}
</div>

<style>
	.status-indicator {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--status-color);
		box-shadow: 0 0 8px var(--status-color);
	}

	.pulse {
		animation: status-pulse 2s ease-in-out infinite;
	}

	.status-label {
		font-size: 0.875rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.status-text {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Size Variations */
	.size-sm .status-dot {
		width: 6px;
		height: 6px;
	}

	.size-sm .status-label {
		font-size: 0.75rem;
	}

	.size-sm .status-text {
		font-size: 0.625rem;
	}

	.size-lg .status-dot {
		width: 14px;
		height: 14px;
	}

	.size-lg .status-label {
		font-size: 1rem;
	}

	@keyframes status-pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(0.9);
		}
	}
</style>
