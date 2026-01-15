/**
 * AI Agent Executor
 * エージェントをAI APIで実行する（キャンセル対応）
 */

import { writable, get } from 'svelte/store';
import { callGemini, callGeminiStream, isApiKeyAvailable, type AgentMessage, type AgentConfig } from './gemini-client';
import { agentStore, logStore } from './simulation';
import { agents as agentDefinitions } from '../data/agents';
import type { Agent } from '../types/agent';

interface AgentExecutionState {
    isRunning: boolean;
    currentAgent: string | null;
    response: string;
    error: string | null;
}

// AbortControllerを保持
let currentAbortController: AbortController | null = null;

function createAgentExecutorStore() {
    const { subscribe, set, update } = writable<AgentExecutionState>({
        isRunning: false,
        currentAgent: null,
        response: '',
        error: null
    });

    // エージェントのシステムプロンプトを生成
    function buildSystemPrompt(agent: Agent): string {
        return `# あなたは「${agent.displayName}」というAIエージェントです

## 役割
${agent.role}

## 能力
${agent.capabilities.map(c => `- ${c}`).join('\n')}

## 制約
${agent.constraints.map(c => `- ${c}`).join('\n')}

## 通信可能なエージェント
- 送信先: ${agent.communication.canSendTo.join(', ') || 'なし'}
- 受信元: ${agent.communication.canReceiveFrom.join(', ') || 'なし'}

## 応答形式
- 簡潔に、役割に沿った応答をしてください
- 分析結果や予測は具体的に示してください
- 不確実な場合は明示してください
`;
    }

    return {
        subscribe,

        // APIキーが利用可能か確認
        isReady: () => isApiKeyAvailable(),

        // 実行をキャンセル
        cancel: () => {
            if (currentAbortController) {
                currentAbortController.abort();
                currentAbortController = null;

                update(s => ({
                    ...s,
                    isRunning: false,
                    error: 'キャンセルされました'
                }));

                // エージェント状態をリセット
                const state = get({ subscribe });
                if (state.currentAgent) {
                    agentStore.updateState(state.currentAgent, { status: 'idle', currentTask: undefined });
                    logStore.add({
                        level: 'warning',
                        source: 'System',
                        message: 'タスクがキャンセルされました'
                    });
                }
            }
        },

        // エージェントを実行
        execute: async (agentName: string, input: string, model?: string): Promise<string> => {
            const agent = agentDefinitions.find(a => a.name === agentName);
            if (!agent) {
                throw new Error(`エージェント ${agentName} が見つかりません`);
            }

            if (!isApiKeyAvailable()) {
                throw new Error('APIキーが設定されていません');
            }

            // 新しいAbortControllerを作成
            currentAbortController = new AbortController();

            update(s => ({ ...s, isRunning: true, currentAgent: agentName, response: '', error: null }));

            // エージェント状態を更新
            agentStore.updateState(agentName, { status: 'active', currentTask: '実行中...' });

            // ログに記録
            logStore.add({
                level: 'info',
                source: agent.displayName,
                message: `タスク開始: ${input.substring(0, 50)}...`
            });

            try {
                const config: AgentConfig = {
                    systemPrompt: buildSystemPrompt(agent),
                    temperature: 0.7,
                    maxTokens: 1024
                };

                const messages: AgentMessage[] = [
                    { role: 'user', content: input }
                ];

                const response = await callGemini(messages, config, model, currentAbortController.signal);

                update(s => ({ ...s, response, isRunning: false }));

                // エージェント状態を更新
                agentStore.updateState(agentName, {
                    status: 'idle',
                    currentTask: undefined,
                    metrics: {
                        ...agent.state.metrics,
                        tasksCompleted: agent.state.metrics.tasksCompleted + 1
                    }
                });

                // ログに記録
                logStore.add({
                    level: 'success',
                    source: agent.displayName,
                    message: 'タスク完了'
                });

                currentAbortController = null;
                return response;
            } catch (error) {
                currentAbortController = null;

                // AbortErrorの場合は特別処理
                if (error instanceof Error && error.name === 'AbortError') {
                    update(s => ({ ...s, error: 'キャンセルされました', isRunning: false }));
                    agentStore.updateState(agentName, { status: 'idle', currentTask: undefined });
                    throw error;
                }

                const errorMessage = error instanceof Error ? error.message : '不明なエラー';

                update(s => ({ ...s, error: errorMessage, isRunning: false }));

                // エージェント状態を更新
                agentStore.updateState(agentName, { status: 'error', currentTask: 'エラー発生' });

                // ログに記録
                logStore.add({
                    level: 'error',
                    source: agent.displayName,
                    message: `エラー: ${errorMessage}`
                });

                throw error;
            }
        },

        // ストリーミング実行（リアルタイム応答）
        executeStream: async (agentName: string, input: string, model?: string): Promise<string> => {
            const agent = agentDefinitions.find(a => a.name === agentName);
            if (!agent) {
                throw new Error(`エージェント ${agentName} が見つかりません`);
            }

            if (!isApiKeyAvailable()) {
                throw new Error('APIキーが設定されていません');
            }

            update(s => ({ ...s, isRunning: true, currentAgent: agentName, response: '', error: null }));

            // エージェント状態を更新
            agentStore.updateState(agentName, { status: 'active', currentTask: '応答中...' });

            // ログに記録
            logStore.add({
                level: 'info',
                source: agent.displayName,
                message: `タスク開始: ${input.substring(0, 50)}...`
            });

            const config: AgentConfig = {
                systemPrompt: buildSystemPrompt(agent),
                temperature: 0.7,
                maxTokens: 1024
            };

            const messages: AgentMessage[] = [
                { role: 'user', content: input }
            ];

            let fullResponse = '';

            try {
                for await (const chunk of callGeminiStream(messages, config, model)) {
                    fullResponse += chunk;
                    update(s => ({ ...s, response: fullResponse }));
                }

                // エージェント状態を更新
                agentStore.updateState(agentName, {
                    status: 'idle',
                    currentTask: undefined,
                    metrics: {
                        ...agent.state.metrics,
                        tasksCompleted: agent.state.metrics.tasksCompleted + 1
                    }
                });

                // ログに記録
                logStore.add({
                    level: 'success',
                    source: agent.displayName,
                    message: 'タスク完了'
                });

                update(s => ({ ...s, isRunning: false }));
                return fullResponse;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '不明なエラー';

                update(s => ({ ...s, error: errorMessage, isRunning: false }));

                // エージェント状態を更新
                agentStore.updateState(agentName, { status: 'error', currentTask: 'エラー発生' });

                // ログに記録
                logStore.add({
                    level: 'error',
                    source: agent.displayName,
                    message: `エラー: ${errorMessage}`
                });

                throw error;
            }
        },

        // リセット
        reset: () => {
            if (currentAbortController) {
                currentAbortController.abort();
                currentAbortController = null;
            }
            set({
                isRunning: false,
                currentAgent: null,
                response: '',
                error: null
            });
        }
    };
}

export const agentExecutor = createAgentExecutorStore();
