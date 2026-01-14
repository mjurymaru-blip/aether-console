<!--
  AgentChat.svelte - エージェントとのチャットパネル
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { agentExecutor } from '$lib/stores/agent-executor';
	import { agentStore } from '$lib/stores/simulation';
	import { settingsStore } from '$lib/stores/settings-store';

	let agents = $derived($agentStore);
	let executorState = $derived($agentExecutor);
	let settings = $derived($settingsStore);

	let selectedAgent = $state('analyzer');
	let userInput = $state('');

	// クライアント側で初期化＋モデル一覧取得
	onMount(async () => {
		settingsStore.init();
		if (settings.apiKeyReady && settings.availableModels.length === 0) {
			await settingsStore.loadModels();
		}
	});

	async function handleSubmit() {
		if (!userInput.trim() || executorState.isRunning) return;

		const input = userInput;
		userInput = '';

		try {
			await agentExecutor.execute(selectedAgent, input, settings.selectedModel);
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
	{#if !settings.apiKeyReady}
		<div class="api-notice">
			<span class="icon">🔑</span>
			<p>AIエージェントを使用するにはAPIキーを設定してください</p>
			<small>右上の ⚙️ ボタンから設定</small>
		</div>
	{:else}
		<div class="chat-header">
			<div class="row">
				<select class="agent-select" bind:value={selectedAgent} disabled={executorState.isRunning}>
					{#each agents as agent}
						<option value={agent.name}>{agent.displayName}</option>
					{/each}
				</select>
				<select 
					class="model-select" 
					bind:value={settings.selectedModel} 
					onchange={(e) => settingsStore.setModel((e.target as HTMLSelectElement).value)}
					disabled={executorState.isRunning || settings.isLoadingModels}
				>
					{#if settings.isLoadingModels}
						<option>読込中...</option>
					{:else if settings.availableModels.length === 0}
						<option>モデルなし</option>
					{:else}
						{#each settings.availableModels as model}
							<option value={model.id}>{model.name}</option>
						{/each}
					{/if}
				</select>
			</div>
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
			{#if executorState.isRunning}
				<button
					class="cancel-btn"
					onclick={() => agentExecutor.cancel()}
				>
					⏹
				</button>
			{:else}
				<button
					class="send-btn"
					onclick={handleSubmit}
					disabled={!userInput.trim()}
				>
					▶
				</button>
			{/if}
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
		margin: 0;
	}

	.api-notice small {
		font-size: 0.7rem;
		color: var(--color-cyan);
	}

	.chat-header {
		margin-bottom: var(--space-md);
	}

	.chat-header .row {
		display: flex;
		gap: var(--space-sm);
	}

	.agent-select {
		flex: 1;
	}

	.model-select {
		width: 160px;
	}

	.chat-header select {
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
		word-break: break-all;
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

	.cancel-btn {
		padding: var(--space-sm) var(--space-md);
		background: rgba(255, 85, 85, 0.2);
		border: 1px solid var(--color-red);
		border-radius: var(--radius-sm);
		color: var(--color-red);
		cursor: pointer;
		font-size: 1rem;
		transition: all var(--transition-fast);
		animation: pulse-cancel 1s infinite;
	}

	.cancel-btn:hover {
		background: rgba(255, 85, 85, 0.3);
		box-shadow: 0 0 15px rgba(255, 85, 85, 0.4);
	}

	@keyframes pulse-cancel {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}
</style>
