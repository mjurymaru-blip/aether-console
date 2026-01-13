# Aether Console

SF風のAIオペレーションルーム — 複数のAIエージェントを可視化・制御するPWA。

## コンセプト

> 画面はSFの司令室。複数のAIエージェントが役割に応じて情報を解析し、最終的な提案をまとめる。

- **世界観 × 技術 × PWA** の融合
- Spec-Kitで各AIの役割を定義
- AI同士が協調・会話し、結果を提示

## 技術スタック

- **SvelteKit** + **TypeScript**
- **Vite** (ビルドツール)
- **Vanilla CSS** (スタイリング)
- **GitHub Pages** (デプロイ)

## 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## プロジェクト構造

```
src/
├── lib/          # 共有コンポーネント・ユーティリティ
├── routes/       # ページ・ルーティング
└── app.html      # HTMLテンプレート

docs/
├── task.md               # タスクリスト
├── tech_stack.md         # 技術選定ドキュメント
└── development_workflow.md  # 開発フロー

.agent/workflows/         # Antigravityワークフロー
```

## ワークフローコマンド

| コマンド | 説明 |
|---------|------|
| `/backup` | Giteaにバックアップ |
| `/publish` | GitHubへ公開 |
| `/review-feedback` | 外部AIレビュー結果を取り込む |
| `/export-context` | repomixでエクスポート |

## ドキュメント

- [技術選定](docs/tech_stack.md)
- [開発フロー](docs/development_workflow.md)
