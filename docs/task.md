# Aether Console タスクリスト

> 詳細なロードマップは [roadmap.md](./roadmap.md) を参照

## Phase 1: フロントエンド完成

### プロジェクト基盤
- [x] リポジトリ初期化（テンプレートから）
- [x] Gitea リモート設定
- [x] 技術スタック選定（SvelteKit + TypeScript）
- [x] SvelteKitプロジェクト初期化
- [x] PWA設定
- [x] GitHub Pages デプロイ設定

### UI基盤
- [x] SF風デザインシステム構築
- [x] 司令室レイアウト実装
- [x] 基本コンポーネント作成

## Phase 2: 静的シミュレーション

- [x] Spec-Kit形式設計（初稿）
- [x] モックシナリオ作成
- [x] シナリオ再生機能
- [x] エージェント間会話表示
- [x] Spec差分の適用・再生
- [x] 差分によるエージェント挙動変化の可視化

## Phase 3: AI統合

- [x] AIエージェント実行基盤
- [x] エージェント状態管理
- [x] WebSocket/SSE接続
- [x] 提案統合機能
- [/] Spec-Flow Studio連携（WebSocket接続中）

## Future: Spec-Flow Studio

> 別プロジェクトとして開発予定

## Phase 4: レビュー指摘対応

### 高優先度
- [x] ログ・パッチの上限設定（無制限蓄積防止）
- [x] WebSocket URLのwss対応

### 中優先度
- [x] チャット履歴の表示（スクロール履歴）
- [x] 視覚効果軽減オプション（アクセシビリティ）

### 将来対応
- [ ] ドメインロジック分離（stores → domain）
- [ ] イベントバージョニング
