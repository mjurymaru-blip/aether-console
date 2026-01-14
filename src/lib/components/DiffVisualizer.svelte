<!--
  DiffVisualizer.svelte - 差分の可視化
-->
<script lang="ts">
	import { appliedPatchesStore } from '$lib/stores/spec-diff';
	import type { SpecDiff } from '$lib/types/spec-diff';

	// 適用済みパッチからすべてのdiffを抽出
	let allDiffs = $derived(
		$appliedPatchesStore.flatMap(patch => 
			patch.diffs.map(d => ({ ...d, patchName: patch.name }))
		)
	);

	// 操作タイプ別アイコン
	const operationIcons: Record<string, string> = {
		add: '+',
		remove: '-',
		modify: '~'
	};

	// 操作タイプ別色
	const operationColors: Record<string, string> = {
		add: 'var(--color-green)',
		remove: 'var(--color-red)',
		modify: 'var(--color-orange)'
	};
</script>

<div class="diff-visualizer">
	{#if allDiffs.length === 0}
		<div class="empty-state">
			<span class="icon">◇</span>
			<p>適用中の差分なし</p>
			<span class="hint">パッチを適用すると差分が表示されます</span>
		</div>
	{:else}
		<div class="diff-list">
			{#each allDiffs as diff}
				{@const color = operationColors[diff.operation]}
				<div class="diff-item" style="--op-color: {color}">
					<div class="diff-header">
						<span class="op-icon">{operationIcons[diff.operation]}</span>
						<span class="agent-name">{diff.agentName}</span>
						<span class="path">{diff.path}</span>
					</div>
					<div class="diff-content">
						{#if diff.operation === 'modify'}
							<div class="before">
								<span class="label">Before:</span>
								<code>{JSON.stringify(diff.before)}</code>
							</div>
							<div class="arrow">→</div>
							<div class="after">
								<span class="label">After:</span>
								<code>{JSON.stringify(diff.after)}</code>
							</div>
						{:else if diff.operation === 'add'}
							<div class="after">
								<span class="label">Add:</span>
								<code>{JSON.stringify(diff.after)}</code>
							</div>
						{:else}
							<div class="before">
								<span class="label">Remove:</span>
								<code>{JSON.stringify(diff.before)}</code>
							</div>
						{/if}
					</div>
					<div class="diff-footer">
						<span class="description">{diff.description}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.diff-visualizer {
		min-height: 100px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100px;
		color: var(--color-text-dim);
		text-align: center;
	}

	.empty-state .icon {
		font-size: 1.5rem;
		opacity: 0.5;
		margin-bottom: var(--space-sm);
	}

	.empty-state p {
		font-size: 0.8rem;
		margin: 0;
	}

	.empty-state .hint {
		font-size: 0.65rem;
		margin-top: var(--space-xs);
	}

	.diff-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.diff-item {
		background: rgba(0, 0, 0, 0.3);
		border-left: 3px solid var(--op-color);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		padding: var(--space-sm);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.diff-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.op-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--op-color);
		color: var(--color-bg-primary);
		border-radius: 2px;
		font-weight: bold;
	}

	.agent-name {
		color: var(--color-cyan);
		text-transform: capitalize;
	}

	.path {
		color: var(--color-text-dim);
	}

	.diff-content {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) 0;
		flex-wrap: wrap;
	}

	.before, .after {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.before .label {
		color: var(--color-red);
	}

	.after .label {
		color: var(--color-green);
	}

	.label {
		font-size: 0.65rem;
		text-transform: uppercase;
	}

	code {
		background: rgba(0, 0, 0, 0.3);
		padding: 2px 6px;
		border-radius: 2px;
		color: var(--color-text-bright);
	}

	.arrow {
		color: var(--color-text-dim);
	}

	.diff-footer {
		margin-top: var(--space-xs);
		padding-top: var(--space-xs);
		border-top: 1px solid var(--color-border);
	}

	.description {
		font-size: 0.7rem;
		color: var(--color-text-dim);
		font-family: var(--font-primary);
	}
</style>
