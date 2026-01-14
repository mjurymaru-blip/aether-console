<!--
  SpecPatcher.svelte - Spec差分適用パネル
-->
<script lang="ts">
	import { predefinedPatches } from '$lib/data/patches';
	import { appliedPatchesStore, appliedPatchIds } from '$lib/stores/spec-diff';
	import type { PredefinedPatch } from '$lib/types/spec-diff';

	// 適用済みパッチID
	let appliedIds = $derived($appliedPatchIds);

	// カテゴリ別アイコン色
	const categoryColors: Record<string, string> = {
		capability: 'var(--color-cyan)',
		constraint: 'var(--color-orange)',
		communication: 'var(--color-green)',
		observability: 'var(--color-blue)'
	};

	// 影響度別色
	const impactColors: Record<string, string> = {
		low: 'var(--color-text-dim)',
		medium: 'var(--color-orange)',
		high: 'var(--color-red)'
	};

	function handleToggle(patch: PredefinedPatch) {
		if (appliedIds.includes(patch.id)) {
			appliedPatchesStore.revert(patch.id);
		} else {
			appliedPatchesStore.apply(patch);
		}
	}

	function getMaxImpact(patch: PredefinedPatch): string {
		const impacts = patch.diffs.map(d => d.impact);
		if (impacts.includes('high')) return 'high';
		if (impacts.includes('medium')) return 'medium';
		return 'low';
	}
</script>

<div class="spec-patcher">
	<div class="patches-list">
		{#each predefinedPatches as patch}
			{@const isApplied = appliedIds.includes(patch.id)}
			{@const maxImpact = getMaxImpact(patch)}
			<div 
				class="patch-item"
				class:applied={isApplied}
				style="--category-color: {categoryColors[patch.category]}; --impact-color: {impactColors[maxImpact]}"
			>
				<div class="patch-header">
					<span class="patch-icon">{patch.icon}</span>
					<div class="patch-info">
						<span class="patch-name">{patch.name}</span>
						<span class="patch-desc">{patch.description}</span>
					</div>
					<button 
						class="toggle-btn"
						class:applied={isApplied}
						onclick={() => handleToggle(patch)}
					>
						{isApplied ? '取消' : '適用'}
					</button>
				</div>
				<div class="patch-meta">
					<span class="category-badge">{patch.category}</span>
					<span class="impact-badge">Impact: {maxImpact}</span>
					<span class="diff-count">{patch.diffs.length} changes</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.spec-patcher {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.patches-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.patch-item {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--category-color);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		transition: all var(--transition-fast);
	}

	.patch-item:hover {
		border-color: var(--category-color);
		background: rgba(0, 255, 255, 0.05);
	}

	.patch-item.applied {
		background: rgba(0, 255, 136, 0.1);
		border-color: var(--color-green);
	}

	.patch-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.patch-icon {
		font-size: 1.2rem;
	}

	.patch-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.patch-name {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.patch-desc {
		font-size: 0.7rem;
		color: var(--color-text-dim);
	}

	.toggle-btn {
		padding: 4px 12px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 0.7rem;
		transition: all var(--transition-fast);
	}

	.toggle-btn:hover {
		border-color: var(--color-cyan);
		color: var(--color-cyan);
	}

	.toggle-btn.applied {
		border-color: var(--color-orange);
		color: var(--color-orange);
	}

	.toggle-btn.applied:hover {
		background: rgba(255, 170, 0, 0.1);
	}

	.patch-meta {
		display: flex;
		gap: var(--space-sm);
		margin-top: var(--space-xs);
		padding-top: var(--space-xs);
	}

	.category-badge,
	.impact-badge,
	.diff-count {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.3);
	}

	.category-badge {
		color: var(--category-color);
		border: 1px solid var(--category-color);
	}

	.impact-badge {
		color: var(--impact-color);
	}

	.diff-count {
		color: var(--color-text-dim);
	}
</style>
