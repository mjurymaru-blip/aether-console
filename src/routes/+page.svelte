<script lang="ts">
	import ConsoleLayout from '$lib/components/ConsoleLayout.svelte';
	import AgentCard from '$lib/components/AgentCard.svelte';
	import ConsoleLog from '$lib/components/ConsoleLog.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import ScenarioPlayer from '$lib/components/ScenarioPlayer.svelte';
	import MessageFlow from '$lib/components/MessageFlow.svelte';
	import SpecPatcher from '$lib/components/SpecPatcher.svelte';
	import DiffVisualizer from '$lib/components/DiffVisualizer.svelte';
	import { agentStore, logStore } from '$lib/stores/simulation';

	// Store から状態を取得
	let agents = $derived($agentStore);
	let logs = $derived($logStore);

	// アクティブなエージェント数
	let activeCount = $derived(agents.filter(a => a.state.status === 'active').length);
	let warningCount = $derived(agents.filter(a => a.state.status === 'warning').length);
	let errorCount = $derived(agents.filter(a => a.state.status === 'error' || a.state.status === 'offline').length);
</script>

<ConsoleLayout>
	<div class="dashboard-grid">
		<!-- Left Column -->
		<section class="left-column">
			<!-- Scenario Player -->
			<Panel title="SCENARIO PLAYER" variant="corner" glow>
				<ScenarioPlayer />
			</Panel>

			<!-- Spec Patcher -->
			<Panel title="SPEC PATCHER" variant="corner">
				<SpecPatcher />
			</Panel>

			<!-- Diff Visualizer -->
			<Panel title="APPLIED CHANGES">
				<DiffVisualizer />
			</Panel>
		</section>

		<!-- Center Column -->
		<section class="center-column">
			<!-- Agent Cards -->
			<Panel title="AGENT STATUS" variant="corner">
				<div class="agents-grid">
					{#each agents as agent}
						<AgentCard 
							name={agent.displayName}
							role={agent.description}
							status={agent.state.status}
							currentTask={agent.state.currentTask}
							progress={agent.state.progress}
							metrics={{
								tasksCompleted: agent.state.metrics.tasksCompleted,
								responseTime: agent.state.metrics.averageResponseTime,
								errorRate: agent.state.metrics.errorRate
							}}
						/>
					{/each}
				</div>
			</Panel>

			<!-- Quick Stats -->
			<Panel title="SYSTEM METRICS">
				<div class="metrics-grid">
					<div class="metric-card">
						<span class="metric-value text-cyan">{activeCount}</span>
						<span class="metric-label">Active</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-green">{agents.length}</span>
						<span class="metric-label">Total</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-orange">{warningCount}</span>
						<span class="metric-label">Warnings</span>
					</div>
					<div class="metric-card">
						<span class="metric-value text-red">{errorCount}</span>
						<span class="metric-label">Errors</span>
					</div>
				</div>
			</Panel>
		</section>

		<!-- Right Column -->
		<section class="right-column">
			<!-- Message Flow -->
			<Panel title="AGENT COMMUNICATION">
				<MessageFlow />
			</Panel>

			<!-- Console Output -->
			<Panel title="CONSOLE OUTPUT" variant="minimal">
				<ConsoleLog {logs} maxHeight="300px" />
			</Panel>
		</section>
	</div>
</ConsoleLayout>

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: 320px 1fr 320px;
		gap: var(--space-lg);
		height: 100%;
	}

	/* Left Column */
	.left-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Center Column */
	.center-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Right Column */
	.right-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Agents Grid */
	.agents-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}

	/* Metrics Grid */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
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

	/* Responsive */
	@media (max-width: 1400px) {
		.dashboard-grid {
			grid-template-columns: 1fr 1fr;
		}

		.left-column {
			grid-column: 1 / 2;
		}

		.center-column {
			grid-column: 2 / 3;
		}

		.right-column {
			grid-column: 1 / 3;
		}
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.left-column,
		.center-column,
		.right-column {
			grid-column: 1;
		}

		.agents-grid {
			grid-template-columns: 1fr;
		}

		.metrics-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
