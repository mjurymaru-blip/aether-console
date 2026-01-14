<script lang="ts">
	import ConsoleLayout from '$lib/components/ConsoleLayout.svelte';
	import AgentCard from '$lib/components/AgentCard.svelte';
	import ConsoleLog from '$lib/components/ConsoleLog.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import ScenarioPlayer from '$lib/components/ScenarioPlayer.svelte';
	import MessageFlow from '$lib/components/MessageFlow.svelte';
	import { agentStore, logStore, simulationStore } from '$lib/stores/simulation';

	// Store から状態を取得
	let agents = $derived($agentStore);
	let logs = $derived($logStore);
	let simulation = $derived($simulationStore);

	// アクティブなエージェント数
	let activeCount = $derived(agents.filter(a => a.state.status === 'active').length);
	let warningCount = $derived(agents.filter(a => a.state.status === 'warning').length);
	let errorCount = $derived(agents.filter(a => a.state.status === 'error' || a.state.status === 'offline').length);
</script>

<ConsoleLayout>
	<div class="dashboard-grid">
		<!-- Left Column: Scenario Player + Message Flow -->
		<section class="left-column">
			<!-- Scenario Player -->
			<Panel title="SCENARIO PLAYER" variant="corner" glow>
				<ScenarioPlayer />
			</Panel>

			<!-- Message Flow -->
			<Panel title="AGENT COMMUNICATION">
				<MessageFlow />
			</Panel>

			<!-- Console Output -->
			<Panel title="CONSOLE OUTPUT" variant="minimal">
				<ConsoleLog {logs} maxHeight="200px" />
			</Panel>
		</section>

		<!-- Right Column: Agent Cards -->
		<section class="right-column">
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
	</div>
</ConsoleLayout>

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-lg);
		height: 100%;
	}

	/* Left Column */
	.left-column {
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
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
	@media (max-width: 1200px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.metrics-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
