/**
 * Simulation Store
 * シナリオ再生の状態管理
 */

import { writable, derived, get } from 'svelte/store';
import type { Agent, AgentState, Message, LogEntry } from '../types/agent';
import type { Scenario, ScenarioStep, SimulationState } from '../types/scenario';
import { agents as initialAgents } from '../data/agents';

// エージェント状態
function createAgentStore() {
    const { subscribe, set, update } = writable<Agent[]>(structuredClone(initialAgents));

    return {
        subscribe,
        reset: () => set(structuredClone(initialAgents)),
        updateState: (agentName: string, newState: Partial<AgentState>) => {
            update(agents => {
                return agents.map(agent => {
                    if (agent.name === agentName) {
                        return {
                            ...agent,
                            state: {
                                ...agent.state,
                                ...newState,
                                lastActivity: new Date()
                            }
                        };
                    }
                    return agent;
                });
            });
        },
        getByName: (name: string): Agent | undefined => {
            return get({ subscribe }).find(a => a.name === name);
        }
    };
}

// メッセージ履歴
const MAX_MESSAGES = 100;

function createMessageStore() {
    const { subscribe, set, update } = writable<Message[]>([]);
    let messageId = 0;

    return {
        subscribe,
        reset: () => {
            set([]);
            messageId = 0;
        },
        add: (message: Omit<Message, 'id' | 'timestamp'>) => {
            update(messages => {
                const newMessages = [
                    ...messages,
                    {
                        ...message,
                        id: `msg-${++messageId}`,
                        timestamp: new Date()
                    } as Message
                ];
                // 上限を超えたら古いものを削除
                return newMessages.slice(-MAX_MESSAGES);
            });
        }
    };
}

// ログ
const MAX_LOGS = 500;

function createLogStore() {
    const { subscribe, set, update } = writable<LogEntry[]>([]);

    return {
        subscribe,
        reset: () => set([]),
        add: (entry: Omit<LogEntry, 'timestamp'>) => {
            const now = new Date();
            const timestamp = now.toLocaleTimeString('ja-JP', { hour12: false });
            update(logs => {
                const newLogs = [...logs, { ...entry, timestamp }];
                // 上限を超えたら古いものを削除
                return newLogs.slice(-MAX_LOGS);
            });
        }
    };
}

// シミュレーション状態
function createSimulationStore() {
    const { subscribe, set, update } = writable<SimulationState>({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        playbackSpeed: 1,
        scenario: null
    });

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let executedSteps: Set<number> = new Set();

    const executeStep = (step: ScenarioStep) => {
        switch (step.action) {
            case 'set-state':
                agentStore.updateState(step.agent, step.state);
                break;
            case 'send-message':
                messageStore.add({
                    from: step.from,
                    to: step.to,
                    type: step.message.type,
                    priority: step.message.priority || 'normal',
                    content: step.message.content
                });
                break;
            case 'console-log':
                logStore.add({
                    level: step.level || 'info',
                    source: step.source,
                    message: step.message
                });
                break;
        }
    };

    const tick = () => {
        update(state => {
            if (!state.scenario || !state.isPlaying || state.isPaused) {
                return state;
            }

            const newTime = state.currentTime + 100 * state.playbackSpeed;

            // 実行すべきステップを探す
            state.scenario.steps.forEach((step, index) => {
                if (step.time <= newTime && !executedSteps.has(index)) {
                    executeStep(step);
                    executedSteps.add(index);
                }
            });

            // シナリオ終了判定
            if (newTime >= state.scenario.duration) {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return {
                    ...state,
                    currentTime: state.scenario.duration,
                    isPlaying: false,
                    isPaused: false
                };
            }

            return { ...state, currentTime: newTime };
        });
    };

    return {
        subscribe,
        loadScenario: (scenario: Scenario) => {
            update(state => ({
                ...state,
                scenario,
                currentTime: 0,
                isPlaying: false,
                isPaused: false
            }));
            executedSteps.clear();
            agentStore.reset();
            messageStore.reset();
            logStore.reset();
        },
        play: () => {
            update(state => {
                if (!state.scenario) return state;
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(tick, 100);
                return { ...state, isPlaying: true, isPaused: false };
            });
        },
        pause: () => {
            update(state => {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return { ...state, isPaused: true };
            });
        },
        resume: () => {
            update(state => {
                if (!state.scenario || !state.isPaused) return state;
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(tick, 100);
                return { ...state, isPaused: false };
            });
        },
        reset: () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            executedSteps.clear();
            agentStore.reset();
            messageStore.reset();
            logStore.reset();
            update(state => ({
                ...state,
                currentTime: 0,
                isPlaying: false,
                isPaused: false
            }));
        },
        setSpeed: (speed: number) => {
            update(state => ({ ...state, playbackSpeed: speed }));
        }
    };
}

// Store exports
export const agentStore = createAgentStore();
export const messageStore = createMessageStore();
export const logStore = createLogStore();
export const simulationStore = createSimulationStore();

// Derived stores
export const activeAgents = derived(agentStore, $agents =>
    $agents.filter(a => a.state.status === 'active')
);

export const recentMessages = derived(messageStore, $messages =>
    $messages.slice(-10)
);
