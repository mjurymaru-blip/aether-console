<!--
  MessageFlow.svelte - エージェント間メッセージの可視化
-->
<script lang="ts">
	import { messageStore } from '$lib/stores/simulation';
	import { agents } from '$lib/data/agents';

	// 最新のメッセージを取得
	let messages = $derived($messageStore.slice(-5));

	// エージェント名からアイコンを取得
	function getAgentIcon(name: string): string {
		const agent = agents.find(a => a.name === name);
		return agent?.icon || '◯';
	}

	// 優先度に応じた色
	function getPriorityColor(priority: string): string {
		switch (priority) {
			case 'critical': return 'var(--color-red)';
			case 'high': return 'var(--color-orange)';
			case 'normal': return 'var(--color-cyan)';
			default: return 'var(--color-text-dim)';
		}
	}
</script>

<div class="message-flow">
	{#if messages.length === 0}
		<div class="empty-state">
			<span class="icon">◇</span>
			<p>メッセージなし</p>
		</div>
	{:else}
		<div class="messages">
			{#each messages as message (message.id)}
				<div class="message-item" style="--priority-color: {getPriorityColor(message.priority)}">
					<div class="message-header">
						<div class="agent from">
							<span class="agent-icon">{getAgentIcon(message.from)}</span>
							<span class="agent-name">{message.from}</span>
						</div>
						<div class="arrow">→</div>
						<div class="agent to">
							<span class="agent-icon">{getAgentIcon(message.to)}</span>
							<span class="agent-name">{message.to}</span>
						</div>
						<span class="priority-badge">{message.priority}</span>
					</div>
					<div class="message-content">
						<span class="message-type">{message.type}</span>
						<span class="message-summary">{message.content.summary}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.message-flow {
		min-height: 150px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 150px;
		color: var(--color-text-dim);
	}

	.empty-state .icon {
		font-size: 2rem;
		opacity: 0.5;
		margin-bottom: var(--space-sm);
	}

	.empty-state p {
		font-size: 0.8rem;
	}

	.messages {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.message-item {
		background: rgba(0, 0, 0, 0.2);
		border-left: 3px solid var(--priority-color);
		padding: var(--space-sm) var(--space-md);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.message-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.agent {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.agent-icon {
		color: var(--color-cyan);
		font-size: 0.9rem;
	}

	.agent-name {
		font-size: 0.75rem;
		text-transform: capitalize;
		font-weight: 500;
	}

	.arrow {
		color: var(--priority-color);
		font-weight: bold;
	}

	.priority-badge {
		margin-left: auto;
		font-size: 0.6rem;
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.3);
		color: var(--priority-color);
		border: 1px solid var(--priority-color);
	}

	.message-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.message-type {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.message-summary {
		font-size: 0.8rem;
		color: var(--color-text);
	}
</style>
