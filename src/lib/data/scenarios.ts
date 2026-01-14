/**
 * Demo Scenarios
 * シナリオ再生用のデモデータ
 */

import type { Scenario } from '../types/scenario';

export const basicAnalysisFlow: Scenario = {
    name: 'basic-analysis-flow',
    description: '基本的な分析フロー：Analyzer → Predictor → Monitor の連携',
    duration: 15000, // 15秒
    steps: [
        // 0s: 初期状態
        {
            time: 0,
            action: 'console-log',
            level: 'info',
            source: 'System',
            message: 'シナリオ開始: basic-analysis-flow'
        },

        // 1s: Analyzerがアクティブに
        {
            time: 1000,
            action: 'set-state',
            agent: 'analyzer',
            state: { status: 'active', currentTask: 'データ受信待機中' }
        },
        {
            time: 1000,
            action: 'console-log',
            level: 'success',
            source: 'Analyzer',
            message: 'Agent online - データ受信待機中'
        },

        // 2s: データ受信・分析開始
        {
            time: 2000,
            action: 'set-state',
            agent: 'analyzer',
            state: { currentTask: 'input-001を分析中', progress: 0.1 }
        },
        {
            time: 2000,
            action: 'console-log',
            level: 'info',
            source: 'Analyzer',
            message: 'データ受信: input-001 (1.2MB)'
        },

        // 3s: 分析進行
        {
            time: 3000,
            action: 'set-state',
            agent: 'analyzer',
            state: { progress: 0.4 }
        },
        {
            time: 3000,
            action: 'console-log',
            level: 'debug',
            source: 'Analyzer',
            message: 'パターン認識モデル適用中...'
        },

        // 4s: 異常検出
        {
            time: 4000,
            action: 'set-state',
            agent: 'analyzer',
            state: { progress: 0.7 }
        },
        {
            time: 4000,
            action: 'console-log',
            level: 'warning',
            source: 'Analyzer',
            message: '異常パターン検出: CPU使用率が通常より20%高い'
        },

        // 5s: 分析完了、Predictorへメッセージ送信
        {
            time: 5000,
            action: 'set-state',
            agent: 'analyzer',
            state: { progress: 1.0, currentTask: '分析完了' }
        },
        {
            time: 5000,
            action: 'send-message',
            from: 'analyzer',
            to: 'predictor',
            message: {
                type: 'analysis-complete',
                priority: 'normal',
                content: {
                    summary: 'データ分析完了',
                    findings: ['トラフィックパターンに異常なし', 'CPU使用率が通常より20%高い'],
                    confidence: 0.85,
                    anomalies: ['high-cpu-usage']
                }
            }
        },
        {
            time: 5000,
            action: 'console-log',
            level: 'success',
            source: 'Analyzer',
            message: '分析完了 → Predictorへ結果送信'
        },

        // 6s: Predictorがアクティブに
        {
            time: 6000,
            action: 'set-state',
            agent: 'analyzer',
            state: { status: 'idle', currentTask: undefined, progress: undefined }
        },
        {
            time: 6000,
            action: 'set-state',
            agent: 'predictor',
            state: { status: 'active', currentTask: '予測モデル実行中', progress: 0.0 }
        },
        {
            time: 6000,
            action: 'console-log',
            level: 'info',
            source: 'Predictor',
            message: 'Analyzerからの分析結果を受信'
        },

        // 7s: 予測実行中
        {
            time: 7000,
            action: 'set-state',
            agent: 'predictor',
            state: { progress: 0.3 }
        },
        {
            time: 7000,
            action: 'console-log',
            level: 'debug',
            source: 'Predictor',
            message: '時系列予測モデルを適用中...'
        },

        // 8s: 予測進行
        {
            time: 8000,
            action: 'set-state',
            agent: 'predictor',
            state: { progress: 0.6 }
        },

        // 9s: Monitorがウォーニング状態に
        {
            time: 9000,
            action: 'set-state',
            agent: 'monitor',
            state: { status: 'warning', currentTask: '閾値チェック中' }
        },
        {
            time: 9000,
            action: 'console-log',
            level: 'warning',
            source: 'Monitor',
            message: 'CPU使用率の異常を検出 - 閾値超過の可能性'
        },

        // 10s: 予測完了、Monitorへ送信
        {
            time: 10000,
            action: 'set-state',
            agent: 'predictor',
            state: { progress: 1.0, currentTask: '予測完了' }
        },
        {
            time: 10000,
            action: 'send-message',
            from: 'predictor',
            to: 'monitor',
            message: {
                type: 'prediction-complete',
                priority: 'high',
                content: {
                    summary: 'CPU使用率は今後30分で更に上昇する見込み',
                    prediction: { cpuIn30min: 0.85, confidence: 0.78 },
                    recommendation: 'スケールアウトを検討してください'
                }
            }
        },
        {
            time: 10000,
            action: 'console-log',
            level: 'success',
            source: 'Predictor',
            message: '予測完了 → Monitorへアラート送信'
        },

        // 11s: Monitorがアラート送信
        {
            time: 11000,
            action: 'set-state',
            agent: 'predictor',
            state: { status: 'idle', currentTask: undefined, progress: undefined }
        },
        {
            time: 11000,
            action: 'set-state',
            agent: 'monitor',
            state: { status: 'active', currentTask: 'アラート発報中' }
        },
        {
            time: 11000,
            action: 'console-log',
            level: 'error',
            source: 'Monitor',
            message: '【ALERT】CPU使用率上昇予測 - 30分以内に85%到達見込み'
        },

        // 12s: Plannerへ送信
        {
            time: 12000,
            action: 'send-message',
            from: 'monitor',
            to: 'planner',
            message: {
                type: 'alert-escalation',
                priority: 'critical',
                content: {
                    summary: 'スケールアウト推奨',
                    alertType: 'capacity-warning',
                    urgency: 'high'
                }
            }
        },
        {
            time: 12000,
            action: 'console-log',
            level: 'info',
            source: 'Monitor',
            message: 'Plannerへエスカレーション送信'
        },

        // 13s: Planner応答なし（オフライン）
        {
            time: 13000,
            action: 'console-log',
            level: 'error',
            source: 'System',
            message: 'Plannerからの応答がありません - エージェントオフライン'
        },

        // 14s: Monitorが待機状態に
        {
            time: 14000,
            action: 'set-state',
            agent: 'monitor',
            state: { status: 'idle', currentTask: undefined }
        },
        {
            time: 14000,
            action: 'console-log',
            level: 'info',
            source: 'System',
            message: 'シナリオ完了: basic-analysis-flow'
        }
    ]
};

export const scenarios: Scenario[] = [basicAnalysisFlow];

export function getScenarioByName(name: string): Scenario | undefined {
    return scenarios.find(s => s.name === name);
}
