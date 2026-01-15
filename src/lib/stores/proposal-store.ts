/**
 * Proposal Store
 * 複数エージェントの出力を統合し、最終提案を生成
 */

import { writable, get } from 'svelte/store';
import { callGemini, callGeminiStream, isApiKeyAvailable, type AgentMessage, type AgentConfig } from './gemini-client';
import { agentStore, logStore } from './simulation';
import { agents as agentDefinitions, getAgentByName } from '../data/agents';
import type { Agent } from '../types/agent';

// 統合対象のエージェント（Synthesizerは除く）
const TARGET_AGENTS = ['analyzer', 'predictor', 'monitor', 'planner'];

interface AgentResult {
    agentName: string;
    displayName: string;
    response: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    error?: string;
}

interface ProposalState {
    isRunning: boolean;
    currentPhase: 'idle' | 'gathering' | 'synthesizing' | 'completed';
    agentResults: AgentResult[];
    finalProposal: string;
    error: string | null;
}

function createProposalStore() {
    const { subscribe, set, update } = writable<ProposalState>({
        isRunning: false,
        currentPhase: 'idle',
        agentResults: [],
        finalProposal: '',
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

## 応答形式
- 簡潔に要点をまとめてください
- 箇条書きを活用してください
- 200文字以内で回答してください
`;
    }

    // Synthesizerのプロンプト生成
    function buildSynthesizerPrompt(input: string, results: AgentResult[]): string {
        const agentResponses = results
            .filter(r => r.status === 'completed')
            .map(r => `### ${r.displayName}\n${r.response}`)
            .join('\n\n');

        return `以下は各専門エージェントからの分析結果です。これらを統合し、包括的な最終提案を生成してください。

## ユーザーからの入力
${input}

## 各エージェントの回答

${agentResponses}

## タスク
上記の全ての回答を統合し、以下の形式で最終提案を出力してください：

1. **総合評価**: 状況の要約
2. **重要ポイント**: 優先順位順に3つ
3. **推奨アクション**: 具体的な次のステップ
4. **リスク・注意点**: 考慮すべき事項
`;
    }

    return {
        subscribe,

        // 統合分析を実行
        runIntegratedAnalysis: async (input: string, model?: string) => {
            if (!isApiKeyAvailable()) {
                update(s => ({ ...s, error: 'APIキーが設定されていません' }));
                return;
            }

            // 初期化
            const initialResults: AgentResult[] = TARGET_AGENTS.map(name => {
                const agent = getAgentByName(name);
                return {
                    agentName: name,
                    displayName: agent?.displayName || name,
                    response: '',
                    status: 'pending' as const
                };
            });

            update(s => ({
                ...s,
                isRunning: true,
                currentPhase: 'gathering',
                agentResults: initialResults,
                finalProposal: '',
                error: null
            }));

            logStore.add({
                level: 'info',
                source: 'System',
                message: '統合分析を開始...'
            });

            // Phase 1: 各エージェントから回答を収集（並列実行）
            const promises = TARGET_AGENTS.map(async (agentName, index) => {
                const agent = getAgentByName(agentName);
                if (!agent) return;

                // 状態を「実行中」に更新
                update(s => {
                    const results = [...s.agentResults];
                    results[index] = { ...results[index], status: 'running' };
                    return { ...s, agentResults: results };
                });

                agentStore.updateState(agentName, { status: 'active', currentTask: '分析中...' });

                try {
                    const config: AgentConfig = {
                        systemPrompt: buildSystemPrompt(agent),
                        temperature: 0.7,
                        maxTokens: 512
                    };

                    const messages: AgentMessage[] = [
                        { role: 'user', content: input }
                    ];

                    const response = await callGemini(messages, config, model);

                    // 状態を「完了」に更新
                    update(s => {
                        const results = [...s.agentResults];
                        results[index] = { ...results[index], response, status: 'completed' };
                        return { ...s, agentResults: results };
                    });

                    agentStore.updateState(agentName, { status: 'idle', currentTask: undefined });

                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : '不明なエラー';
                    update(s => {
                        const results = [...s.agentResults];
                        results[index] = { ...results[index], status: 'error', error: errorMsg };
                        return { ...s, agentResults: results };
                    });

                    agentStore.updateState(agentName, { status: 'error', currentTask: 'エラー' });
                }
            });

            await Promise.all(promises);

            // Phase 2: Synthesizerで統合
            update(s => ({ ...s, currentPhase: 'synthesizing' }));

            const synthesizer = getAgentByName('synthesizer');
            if (synthesizer) {
                agentStore.updateState('synthesizer', { status: 'active', currentTask: '統合中...' });

                try {
                    const currentState = get({ subscribe });
                    const synthesizerPrompt = buildSynthesizerPrompt(input, currentState.agentResults);

                    const config: AgentConfig = {
                        systemPrompt: buildSystemPrompt(synthesizer),
                        temperature: 0.7,
                        maxTokens: 1024
                    };

                    const messages: AgentMessage[] = [
                        { role: 'user', content: synthesizerPrompt }
                    ];

                    let finalProposal = '';

                    // ストリーミングで統合結果を表示
                    for await (const chunk of callGeminiStream(messages, config, model)) {
                        finalProposal += chunk;
                        update(s => ({ ...s, finalProposal }));
                    }

                    agentStore.updateState('synthesizer', { status: 'idle', currentTask: undefined });

                    logStore.add({
                        level: 'success',
                        source: 'Synthesizer',
                        message: '統合分析完了'
                    });

                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : '不明なエラー';
                    update(s => ({ ...s, error: errorMsg }));
                    agentStore.updateState('synthesizer', { status: 'error', currentTask: 'エラー' });
                }
            }

            update(s => ({ ...s, isRunning: false, currentPhase: 'completed' }));
        },

        // リセット
        reset: () => {
            set({
                isRunning: false,
                currentPhase: 'idle',
                agentResults: [],
                finalProposal: '',
                error: null
            });
        }
    };
}

export const proposalStore = createProposalStore();
