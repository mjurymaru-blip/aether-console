<!--
  AgentCard.svelte - AIエージェントカード
  
  各エージェントの詳細情報を表示するカード
-->
<script lang="ts">
	import StatusIndicator from './StatusIndicator.svelte';

	interface Props {
		name: string;
		role: string;
		status: 'active' | 'idle' | 'warning' | 'error' | 'offline';
		description?: string;
		currentTask?: string;
		progress?: number;
		metrics?: {
			tasksCompleted?: number;
			responseTime?: string;
			errorRate?: number;
		};
	}

	let { name, role, status, description, currentTask, progress, metrics } = $props<Props>();
</script>

<div class="agent-card" class:active={status === 'active'}>
	<div class="card-header">
		<div class="agent-identity">
			<span class="agent-icon">◈</span>
			<div class="agent-info">
				<h3 class="agent-name">{name}</h3>
				<span class="agent-role">{role}</span>
			</div>
		</div>
		<StatusIndicator {status} size="md" />
	</div>

	{#if description}
		<p class="agent-description">{description}</p>
	{/if}

	{#if currentTask}
		<div class="current-task">
			<span class="task-label">CURRENT TASK</span>
			<span class="task-value">{currentTask}</span>
			{#if progress !== undefined}
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress * 100}%"></div>
				</div>
			{/if}
		</div>
	{/if}

	{#if metrics}
		<div class="metrics">
			{#if metrics.tasksCompleted !== undefined}
				<div class="metric">
					<span class="metric-value">{metrics.tasksCompleted}</span>
					<span class="metric-label">Tasks</span>
				</div>
			{/if}
			{#if metrics.responseTime}
				<div class="metric">
					<span class="metric-value">{metrics.responseTime}</span>
					<span class="metric-label">Avg Time</span>
				</div>
			{/if}
			{#if metrics.errorRate !== undefined}
				<div class="metric">
					<span class="metric-value" class:error={metrics.errorRate > 0.1}>
						{(metrics.errorRate * 100).toFixed(1)}%
					</span>
					<span class="metric-label">Errors</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.agent-card {
		background: var(--color-bg-panel);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		transition: all var(--transition-normal);
	}

	.agent-card:hover {
		border-color: var(--color-border-bright);
		box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
	}

	.agent-card.active {
		border-color: var(--color-green);
		box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-md);
	}

	.agent-identity {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.agent-icon {
		font-size: 1.5rem;
		color: var(--color-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.agent-info {
		display: flex;
		flex-direction: column;
	}

	.agent-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.agent-role {
		font-size: 0.7rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.agent-description {
		font-size: 0.8rem;
		color: var(--color-text-dim);
		margin: 0 0 var(--space-md);
		line-height: 1.5;
	}

	.current-task {
		background: rgba(0, 255, 255, 0.05);
		border-left: 2px solid var(--color-cyan);
		padding: var(--space-sm) var(--space-md);
		margin-bottom: var(--space-md);
	}

	.task-label {
		display: block;
		font-size: 0.6rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: var(--space-xs);
	}

	.task-value {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--color-cyan);
	}

	.progress-bar {
		height: 3px;
		background: var(--color-bg-secondary);
		margin-top: var(--space-sm);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyan), var(--color-blue));
		transition: width var(--transition-normal);
	}

	.metrics {
		display: flex;
		gap: var(--space-lg);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.metric {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.metric-value {
		font-size: 1rem;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--color-text-bright);
	}

	.metric-value.error {
		color: var(--color-red);
	}

	.metric-label {
		font-size: 0.6rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
	}
</style>
