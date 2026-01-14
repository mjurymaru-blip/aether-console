<script lang="ts">
	import ConsoleLayout from '$lib/components/ConsoleLayout.svelte';
	import AgentCard from '$lib/components/AgentCard.svelte';
	import ConsoleLog from '$lib/components/ConsoleLog.svelte';
	import Panel from '$lib/components/Panel.svelte';

	// モックデータ: エージェント
	const agents = [
		{
			name: 'Analyzer',
			role: '情報解析',
			status: 'active' as const,
			description: '入力データを分析し、パターンや異常を検出',
			currentTask: 'analyzing-input-001',
			progress: 0.65,
			metrics: { tasksCompleted: 42, responseTime: '1.2s', errorRate: 0.02 }
		},
		{
			name: 'Predictor',
			role: '予測',
			status: 'idle' as const,
			description: 'トレンドとリスクを予測し、将来の状態を推定',
			metrics: { tasksCompleted: 28, responseTime: '2.1s', errorRate: 0.01 }
		},
		{
			name: 'Monitor',
			role: 'リスク監視',
			status: 'warning' as const,
			description: '異常検知とアラート発報を担当',
			currentTask: 'checking-thresholds',
			progress: 0.3,
			metrics: { tasksCompleted: 156, responseTime: '0.5s', errorRate: 0.15 }
		},
		{
			name: 'Planner',
			role: '計画立案',
			status: 'offline' as const,
			description: '次のアクションを提案し、実行計画を作成',
			metrics: { tasksCompleted: 12, responseTime: '3.5s', errorRate: 0.05 }
		}
	];

	// モックデータ: ログ
	const logs = [
		{ timestamp: '22:35:01', level: 'info' as const, message: 'System initialized' },
		{ timestamp: '22:35:02', level: 'success' as const, source: 'Analyzer', message: 'Agent online' },
		{ timestamp: '22:35:03', level: 'info' as const, source: 'System', message: 'Connecting to Spec-Flow Studio...' },
		{ timestamp: '22:35:05', level: 'warning' as const, source: 'Monitor', message: 'High error rate detected (15%)' },
		{ timestamp: '22:35:08', level: 'info' as const, source: 'Analyzer', message: 'Started task: analyzing-input-001' },
		{ timestamp: '22:35:12', level: 'debug' as const, source: 'Predictor', message: 'Model cache refreshed' },
		{ timestamp: '22:35:15', level: 'error' as const, source: 'Planner', message: 'Connection timeout - agent offline' },
		{ timestamp: '22:35:20', level: 'info' as const, message: 'Waiting for input...' }
	];
</script>

<ConsoleLayout>
	<div class="dashboard-grid">
		<!-- Agents Section -->
		<section class="agents-section">
			<Panel title="AGENT STATUS" variant="corner">
				<div class="agents-grid">
					{#each agents as agent}
						<AgentCard {...agent} />
					{/each}
				</div>
			</Panel>
		</section>

		<!-- Right Column -->
		<aside class="sidebar">
			<!-- Console Output -->
			<Panel title="CONSOLE OUTPUT" variant="minimal">
				<ConsoleLog {logs} maxHeight="200px" />
			</Panel>

			<!-- Quick Stats -->
			<Panel title="SYSTEM METRICS">
				<div class="metrics-grid">
					<div class="metric-card">
						<span class="metric-value text-cyan">4</span>
						<span class="metric-label">Active Agents</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-green">238</span>
						<span class="metric-label">Tasks Today</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-orange">3</span>
						<span class="metric-label">Warnings</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-red">1</span>
						<span class="metric-label">Errors</span>
					</div>
				</div>
			</Panel>

			<!-- Spec-Flow Preview -->
			<Panel title="SPEC-FLOW STUDIO" glow>
				<div class="spec-preview">
					<div class="preview-placeholder">
						<span class="icon">◈</span>
						<p>Connecting to Spec-Flow Studio...</p>
						<span class="status">Waiting for connection</span>
					</div>
				</div>
			</Panel>
		</aside>
	</div>
</ConsoleLayout>

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: var(--space-lg);
		height: 100%;
	}

	/* Agents Section */
	.agents-section {
		display: flex;
		flex-direction: column;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-md);
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Metrics Grid */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);
	}

	.metric-card {
		background: rgba(0, 0, 0, 0.2);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.metric-card .metric-value {
		display: block;
		font-size: 1.5rem;
		font-weight: 600;
		font-family: var(--font-mono);
	}

	.metric-card .metric-label {
		font-size: 0.65rem;
		color: var(--color-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Spec Preview */
	.spec-preview {
		min-height: 120px;
	}

	.preview-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: var(--color-text-dim);
	}

	.preview-placeholder .icon {
		font-size: 2rem;
		color: var(--color-cyan);
		opacity: 0.5;
		margin-bottom: var(--space-sm);
		animation: pulse 2s infinite;
	}

	.preview-placeholder p {
		font-size: 0.8rem;
		margin: 0 0 var(--space-xs);
	}

	.preview-placeholder .status {
		font-size: 0.65rem;
		font-family: var(--font-mono);
		color: var(--color-cyan);
		opacity: 0.7;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.sidebar {
			order: -1;
		}
	}
</style>
