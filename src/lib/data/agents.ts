/**
 * Agent Definitions
 * Spec-Kit形式に基づくエージェント定義
 */

import type { Agent } from '../types/agent';

export const agents: Agent[] = [
    {
        name: 'analyzer',
        displayName: 'Analyzer',
        description: '入力データを分析し、パターンや異常を検出',
        icon: '◈',
        role: '入力データを分析し、構造化された情報を抽出する。パターンや異常を検出し、他のエージェントに報告する。',
        capabilities: ['data-analysis', 'pattern-recognition', 'anomaly-detection'],
        constraints: ['推測で情報を補完しない', '確信度が低い場合は明示する'],
        communication: {
            canSendTo: ['predictor', 'planner', 'monitor'],
            canReceiveFrom: ['planner', 'monitor']
        },
        state: {
            agentName: 'analyzer',
            status: 'idle',
            lastActivity: new Date(),
            metrics: {
                tasksCompleted: 42,
                averageResponseTime: '1.2s',
                errorRate: 0.02
            }
        }
    },
    {
        name: 'predictor',
        displayName: 'Predictor',
        description: 'トレンドとリスクを予測し、将来の状態を推定',
        icon: '◇',
        role: '過去のデータと現在の分析結果から、将来のトレンドとリスクを予測する。',
        capabilities: ['trend-analysis', 'risk-prediction', 'forecasting'],
        constraints: ['予測の信頼区間を明示する', '不確実性を隠さない'],
        communication: {
            canSendTo: ['planner', 'monitor'],
            canReceiveFrom: ['analyzer', 'monitor']
        },
        state: {
            agentName: 'predictor',
            status: 'idle',
            lastActivity: new Date(),
            metrics: {
                tasksCompleted: 28,
                averageResponseTime: '2.1s',
                errorRate: 0.01
            }
        }
    },
    {
        name: 'monitor',
        displayName: 'Monitor',
        description: '異常検知とアラート発報を担当',
        icon: '◉',
        role: 'システム全体を監視し、異常を検知したらアラートを発報する。',
        capabilities: ['anomaly-detection', 'alerting', 'threshold-monitoring'],
        constraints: ['誤検知を最小化する', 'アラート疲れを防ぐ'],
        communication: {
            canSendTo: ['analyzer', 'predictor', 'planner'],
            canReceiveFrom: ['analyzer', 'predictor']
        },
        state: {
            agentName: 'monitor',
            status: 'idle',
            lastActivity: new Date(),
            metrics: {
                tasksCompleted: 156,
                averageResponseTime: '0.5s',
                errorRate: 0.15
            }
        }
    },
    {
        name: 'planner',
        displayName: 'Planner',
        description: '次のアクションを提案し、実行計画を作成',
        icon: '◆',
        role: '他のエージェントからの情報を統合し、最適なアクションプランを提案する。',
        capabilities: ['action-planning', 'resource-allocation', 'prioritization'],
        constraints: ['リスクを考慮した計画を立てる', '実行可能性を担保する'],
        communication: {
            canSendTo: ['analyzer', 'monitor'],
            canReceiveFrom: ['analyzer', 'predictor', 'monitor']
        },
        state: {
            agentName: 'planner',
            status: 'offline',
            lastActivity: new Date(),
            metrics: {
                tasksCompleted: 12,
                averageResponseTime: '3.5s',
                errorRate: 0.05
            }
        }
    }
];

export function getAgentByName(name: string): Agent | undefined {
    return agents.find(a => a.name === name);
}
