/**
 * AI Agent Executor
 * エージェントをAI APIで実行する
 */

import { writable, get } from 'svelte/store';
import { callGemini, callGeminiStream, isApiKeyAvailable, type AgentMessage, type AgentConfig } from './gemini-client';
import { agentStore, logStore, messageStore } from './simulation';
import { agents as agentDefinitions } from '../data/agents';
import type { Agent } from '../types/agent';

interface AgentExecutionState {
    isRunning: boolean;
    currentAgent: string | null;
    response: string;
    error: string | null;
}

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

        // エージェントを実行
        execute: async (agentName: string, input: string): Promise<string> => {
            const agent = agentDefinitions.find(a => a.name === agentName);
            if (!agent) {
                throw new Error(`エージェント ${agentName} が見つかりません`);
            }

            if (!isApiKeyAvailable()) {
                throw new Error('APIキーが設定されていません');
            }

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

                const response = await callGemini(messages, config);

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

                return response;
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

        // ストリーミング実行
        executeStream: async function* (agentName: string, input: string): AsyncGenerator<string, void, unknown> {
            const agent = agentDefinitions.find(a => a.name === agentName);
            if (!agent) {
                throw new Error(`エージェント ${agentName} が見つかりません`);
            }

            if (!isApiKeyAvailable()) {
                throw new Error('APIキーが設定されていません');
            }

            update(s => ({ ...s, isRunning: true, currentAgent: agentName, response: '', error: null }));
            agentStore.updateState(agentName, { status: 'active', currentTask: '実行中...' });

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
                for await (const chunk of callGeminiStream(messages, config)) {
                    fullResponse += chunk;
                    update(s => ({ ...s, response: fullResponse }));
                    yield chunk;
                }

                agentStore.updateState(agentName, { status: 'idle', currentTask: undefined });
                logStore.add({
                    level: 'success',
                    source: agent.displayName,
                    message: 'タスク完了'
                });

                update(s => ({ ...s, isRunning: false }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '不明なエラー';
                update(s => ({ ...s, error: errorMessage, isRunning: false }));
                agentStore.updateState(agentName, { status: 'error', currentTask: 'エラー発生' });
                throw error;
            }
        },

        // リセット
        reset: () => {
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
