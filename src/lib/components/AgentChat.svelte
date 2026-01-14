<!--
  AgentChat.svelte - エージェントとのチャットパネル
-->
<script lang="ts">
	import { agentExecutor } from '$lib/stores/agent-executor';
	import { agentStore } from '$lib/stores/simulation';
	import { isApiKeyAvailable } from '$lib/stores/gemini-client';

	let agents = $derived($agentStore);
	let executorState = $derived($agentExecutor);

	let selectedAgent = $state('analyzer');
	let userInput = $state('');
	let isApiReady = $state(false);

	// APIキーの状態を定期的にチェック
	$effect(() => {
		isApiReady = isApiKeyAvailable();
	});

	async function handleSubmit() {
		if (!userInput.trim() || executorState.isRunning) return;

		const input = userInput;
		userInput = '';

		try {
			await agentExecutor.execute(selectedAgent, input);
		} catch (error) {
			// エラーはstore経由で表示
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="agent-chat">
	{#if !isApiReady}
		<div class="api-notice">
			<span class="icon">🔑</span>
			<p>AIエージェントを使用するにはAPIキーを設定してください</p>
		</div>
	{:else}
		<div class="chat-header">
			<select bind:value={selectedAgent} disabled={executorState.isRunning}>
				{#each agents as agent}
					<option value={agent.name}>{agent.displayName} - {agent.description}</option>
				{/each}
			</select>
		</div>

		<div class="chat-response">
			{#if executorState.isRunning}
				<div class="loading">
					<span class="spinner">◇</span>
					<span>思考中...</span>
				</div>
			{:else if executorState.error}
				<div class="error">
					<span class="icon">⚠️</span>
					<span>{executorState.error}</span>
				</div>
			{:else if executorState.response}
				<div class="response">
					<pre>{executorState.response}</pre>
				</div>
			{:else}
				<div class="placeholder">
					<span class="icon">◈</span>
					<p>エージェントにタスクを与えてください</p>
				</div>
			{/if}
		</div>

		<div class="chat-input">
			<textarea
				bind:value={userInput}
				onkeydown={handleKeyDown}
				placeholder="タスクを入力... (Enter で送信)"
				disabled={executorState.isRunning}
			></textarea>
			<button
				class="send-btn"
				onclick={handleSubmit}
				disabled={!userInput.trim() || executorState.isRunning}
			>
				▶
			</button>
		</div>
	{/if}
</div>

<style>
	.agent-chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 300px;
	}

	.api-notice {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-dim);
		text-align: center;
		gap: var(--space-sm);
	}

	.api-notice .icon {
		font-size: 2rem;
	}

	.api-notice p {
		font-size: 0.8rem;
	}

	.chat-header {
		margin-bottom: var(--space-md);
	}

	.chat-header select {
		width: 100%;
		padding: var(--space-sm);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-size: 0.8rem;
	}

	.chat-header select:focus {
		outline: none;
		border-color: var(--color-cyan);
	}

	.chat-response {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-md);
		min-height: 150px;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-cyan);
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.error {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		color: var(--color-red);
		font-size: 0.8rem;
	}

	.response pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.6;
	}

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-dim);
	}

	.placeholder .icon {
		font-size: 1.5rem;
		opacity: 0.5;
		margin-bottom: var(--space-sm);
	}

	.placeholder p {
		font-size: 0.8rem;
	}

	.chat-input {
		display: flex;
		gap: var(--space-sm);
	}

	.chat-input textarea {
		flex: 1;
		padding: var(--space-sm);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-size: 0.85rem;
		resize: none;
		min-height: 60px;
	}

	.chat-input textarea:focus {
		outline: none;
		border-color: var(--color-cyan);
	}

	.send-btn {
		padding: var(--space-sm) var(--space-md);
		background: rgba(0, 255, 255, 0.1);
		border: 1px solid var(--color-cyan);
		border-radius: var(--radius-sm);
		color: var(--color-cyan);
		cursor: pointer;
		font-size: 1rem;
		transition: all var(--transition-fast);
	}

	.send-btn:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.2);
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
	}

	.send-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
