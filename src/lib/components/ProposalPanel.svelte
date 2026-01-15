<!--
  ProposalPanel.svelte - 統合提案パネル
  複数エージェントからの出力を統合し、最終提案を表示
-->
<script lang="ts">
	import { proposalStore } from '$lib/stores/proposal-store';
	import { settingsStore } from '$lib/stores/settings-store';

	let proposalState = $derived($proposalStore);
	let settings = $derived($settingsStore);

	let userInput = $state('');

	async function handleSubmit() {
		if (!userInput.trim() || proposalState.isRunning) return;

		const input = userInput;
		userInput = '';

		await proposalStore.runIntegratedAnalysis(input, settings.selectedModel);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'pending': return '○';
			case 'running': return '◇';
			case 'completed': return '✓';
			case 'error': return '✗';
			default: return '○';
		}
	}

	function getStatusClass(status: string): string {
		switch (status) {
			case 'pending': return 'status-pending';
			case 'running': return 'status-running';
			case 'completed': return 'status-completed';
			case 'error': return 'status-error';
			default: return '';
		}
	}
</script>

<div class="proposal-panel">
	{#if !settings.apiKeyReady}
		<div class="api-notice">
			<span class="icon">🔑</span>
			<p>統合分析を使用するにはAPIキーを設定してください</p>
		</div>
	{:else}
		<!-- 入力フィールド -->
		<div class="input-section">
			<textarea
				bind:value={userInput}
				onkeydown={handleKeyDown}
				placeholder="分析対象を入力... (Enter で実行)"
				disabled={proposalState.isRunning}
			></textarea>
			<button
				class="run-btn"
				onclick={handleSubmit}
				disabled={!userInput.trim() || proposalState.isRunning}
			>
				{proposalState.isRunning ? '実行中...' : '統合分析'}
			</button>
		</div>

		<!-- エージェント進捗 -->
		{#if proposalState.agentResults.length > 0}
			<div class="agent-progress">
				<div class="phase-indicator">
					{#if proposalState.currentPhase === 'gathering'}
						<span class="phase">📡 情報収集中</span>
					{:else if proposalState.currentPhase === 'synthesizing'}
						<span class="phase">🔄 統合中</span>
					{:else if proposalState.currentPhase === 'completed'}
						<span class="phase">✅ 完了</span>
					{/if}
				</div>
				<div class="agent-list">
					{#each proposalState.agentResults as result}
						<div class="agent-item {getStatusClass(result.status)}">
							<span class="status-icon">{getStatusIcon(result.status)}</span>
							<span class="agent-name">{result.displayName}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 各エージェントの回答 -->
		{#if proposalState.agentResults.some(r => r.response)}
			<div class="agent-responses">
				<h4>各エージェントの分析</h4>
				{#each proposalState.agentResults.filter(r => r.response) as result}
					<details class="response-item">
						<summary>{result.displayName}</summary>
						<pre>{result.response}</pre>
					</details>
				{/each}
			</div>
		{/if}

		<!-- 最終提案 -->
		{#if proposalState.finalProposal}
			<div class="final-proposal">
				<h4>📋 統合提案</h4>
				<pre>{proposalState.finalProposal}</pre>
			</div>
		{/if}

		<!-- エラー表示 -->
		{#if proposalState.error}
			<div class="error">
				<span>⚠️ {proposalState.error}</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	.proposal-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		height: 100%;
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

	.input-section {
		display: flex;
		gap: var(--space-sm);
	}

	.input-section textarea {
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

	.input-section textarea:focus {
		outline: none;
		border-color: var(--color-cyan);
	}

	.run-btn {
		padding: var(--space-sm) var(--space-md);
		background: rgba(0, 255, 136, 0.1);
		border: 1px solid var(--color-green);
		border-radius: var(--radius-sm);
		color: var(--color-green);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.run-btn:hover:not(:disabled) {
		background: rgba(0, 255, 136, 0.2);
		box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
	}

	.run-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.agent-progress {
		padding: var(--space-sm);
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--radius-sm);
	}

	.phase-indicator {
		margin-bottom: var(--space-sm);
	}

	.phase {
		font-size: 0.75rem;
		color: var(--color-cyan);
	}

	.agent-list {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.agent-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: 0.7rem;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.2);
	}

	.status-icon {
		font-size: 0.8rem;
	}

	.status-pending { color: var(--color-text-dim); }
	.status-running { color: var(--color-cyan); }
	.status-running .status-icon { animation: spin 1s linear infinite; }
	.status-completed { color: var(--color-green); }
	.status-error { color: var(--color-red); }

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.agent-responses {
		flex: 1;
		overflow-y: auto;
	}

	.agent-responses h4 {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		margin: 0 0 var(--space-sm) 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.response-item {
		margin-bottom: var(--space-sm);
	}

	.response-item summary {
		font-size: 0.8rem;
		cursor: pointer;
		padding: var(--space-xs) var(--space-sm);
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--radius-sm);
		color: var(--color-cyan);
	}

	.response-item pre {
		margin: var(--space-xs) 0 0 0;
		padding: var(--space-sm);
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-word;
		background: rgba(0, 0, 0, 0.1);
		border-radius: var(--radius-sm);
	}

	.final-proposal {
		padding: var(--space-md);
		background: rgba(0, 255, 255, 0.05);
		border: 1px solid rgba(0, 255, 255, 0.2);
		border-radius: var(--radius-sm);
	}

	.final-proposal h4 {
		font-size: 0.85rem;
		color: var(--color-cyan);
		margin: 0 0 var(--space-sm) 0;
	}

	.final-proposal pre {
		margin: 0;
		font-size: 0.8rem;
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.6;
	}

	.error {
		padding: var(--space-sm);
		background: rgba(255, 85, 85, 0.1);
		border-radius: var(--radius-sm);
		color: var(--color-red);
		font-size: 0.8rem;
	}
</style>
