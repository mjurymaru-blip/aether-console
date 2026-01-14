/**
 * Predefined Spec Patches
 * デモ用の事前定義パッチ
 */

import type { PredefinedPatch } from '../types/spec-diff';

export const predefinedPatches: PredefinedPatch[] = [
    {
        id: 'patch-001',
        name: 'Analyzer高速化',
        description: 'Analyzerにストリーミング解析能力を追加',
        icon: '⚡',
        category: 'capability',
        diffs: [
            {
                agentName: 'analyzer',
                operation: 'add',
                path: 'capabilities',
                after: 'streaming-analysis',
                description: 'ストリーミング解析能力を追加',
                impact: 'medium'
            }
        ]
    },
    {
        id: 'patch-002',
        name: 'Monitor精度向上',
        description: 'Monitorの誤検知防止制約を強化',
        icon: '🎯',
        category: 'constraint',
        diffs: [
            {
                agentName: 'monitor',
                operation: 'modify',
                path: 'constraints[0]',
                before: '誤検知を最小化する',
                after: '誤検知率5%以下を維持する',
                description: '誤検知防止制約を厳格化',
                impact: 'high'
            }
        ]
    },
    {
        id: 'patch-003',
        name: 'Plannerオンライン化',
        description: 'オフラインのPlannerをアクティブ化',
        icon: '🔌',
        category: 'communication',
        diffs: [
            {
                agentName: 'planner',
                operation: 'modify',
                path: 'state.status',
                before: 'offline',
                after: 'active',
                description: 'Plannerをオンラインに変更',
                impact: 'high'
            }
        ]
    },
    {
        id: 'patch-004',
        name: 'Predictor-Analyzer直接通信',
        description: 'PredictorがAnalyzerに直接フィードバックできるように',
        icon: '🔗',
        category: 'communication',
        diffs: [
            {
                agentName: 'predictor',
                operation: 'add',
                path: 'communication.canSendTo',
                after: 'analyzer',
                description: 'PredictorからAnalyzerへの通信を許可',
                impact: 'medium'
            },
            {
                agentName: 'analyzer',
                operation: 'add',
                path: 'communication.canReceiveFrom',
                after: 'predictor',
                description: 'AnalyzerがPredictorからの通信を受信可能に',
                impact: 'medium'
            }
        ]
    },
    {
        id: 'patch-005',
        name: 'ログレベル詳細化',
        description: '全エージェントのログレベルをdebugに変更',
        icon: '📋',
        category: 'observability',
        diffs: [
            {
                agentName: 'analyzer',
                operation: 'modify',
                path: 'observability.logLevel',
                before: 'info',
                after: 'debug',
                description: 'ログレベルをdebugに変更',
                impact: 'low'
            },
            {
                agentName: 'predictor',
                operation: 'modify',
                path: 'observability.logLevel',
                before: 'info',
                after: 'debug',
                description: 'ログレベルをdebugに変更',
                impact: 'low'
            }
        ]
    }
];

export function getPatchById(id: string): PredefinedPatch | undefined {
    return predefinedPatches.find(p => p.id === id);
}
