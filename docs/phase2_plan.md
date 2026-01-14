# Phase 2: 静的シミュレーション 実装計画

## 目標

「AIがいなくても、"AIが制御されている感覚"が体験できる」

---

## Proposed Changes

### 1. データモデル層

#### [NEW] [types/agent.ts](file:///home/gemini1/workspace3/aether-console/src/lib/types/agent.ts)
- エージェント、メッセージ、シナリオの型定義
- Spec-Kit形式をTypeScriptで表現

#### [NEW] [types/scenario.ts](file:///home/gemini1/workspace3/aether-console/src/lib/types/scenario.ts)
- シナリオステップの型定義
- アクションタイプ（set-state, send-message, console-log）

---

### 2. モックデータ

#### [NEW] [data/agents.ts](file:///home/gemini1/workspace3/aether-console/src/lib/data/agents.ts)
- 4つのエージェント定義（Analyzer, Predictor, Monitor, Planner）
- Spec-Kit形式に準拠

#### [NEW] [data/scenarios.ts](file:///home/gemini1/workspace3/aether-console/src/lib/data/scenarios.ts)
- デモ用シナリオ「basic-analysis-flow」
- エージェント間の会話フロー

---

### 3. 状態管理（Svelte Store）

#### [NEW] [stores/simulation.ts](file:///home/gemini1/workspace3/aether-console/src/lib/stores/simulation.ts)
- シミュレーション状態の管理
- エージェント状態、メッセージ履歴、ログ
- シナリオ再生コントローラー

---

### 4. UIコンポーネント

#### [NEW] [ScenarioPlayer.svelte](file:///home/gemini1/workspace3/aether-console/src/lib/components/ScenarioPlayer.svelte)
- 再生/一時停止/リセットボタン
- 進行状況バー
- 再生速度調整

#### [NEW] [MessageFlow.svelte](file:///home/gemini1/workspace3/aether-console/src/lib/components/MessageFlow.svelte)
- エージェント間メッセージの可視化
- 送信元 → 送信先のフロー表示

#### [MODIFY] [+page.svelte](file:///home/gemini1/workspace3/aether-console/src/routes/+page.svelte)
- ScenarioPlayerを統合
- 動的なエージェント状態表示
- メッセージフロー表示

---

## シナリオ再生の仕組み

```
┌─────────────────────────────────────────────┐
│  ScenarioPlayer (コントローラー)              │
│  ┌─────────────────────────────────────┐    │
│  │ ▶ Play  ⏸ Pause  ⏹ Reset  ⏩ 2x  │    │
│  │ ───●─────────────── 45%            │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
        ↓ dispatch
┌─────────────────────────────────────────────┐
│  simulation store                           │
│  - currentTime: number                      │
│  - agentStates: Map<string, AgentState>     │
│  - messages: Message[]                      │
│  - logs: LogEntry[]                         │
└─────────────────────────────────────────────┘
        ↓ subscribe
┌─────────────────────────────────────────────┐
│  UI Components                              │
│  - AgentCard (状態更新)                      │
│  - ConsoleLog (ログ追加)                     │
│  - MessageFlow (メッセージ表示)              │
└─────────────────────────────────────────────┘
```

---

## Verification Plan

### 開発サーバーでの確認
```bash
npm run dev
```

### 確認ポイント
1. **シナリオ再生**: Playボタンでシナリオが開始されるか
2. **エージェント状態変化**: AgentCardのステータスがリアルタイムで変化するか
3. **コンソールログ**: シナリオ進行に合わせてログが追加されるか
4. **メッセージフロー**: エージェント間の通信が可視化されるか
5. **一時停止/リセット**: コントロールが正常に動作するか
