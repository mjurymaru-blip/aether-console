# Aether Console

SF風のAIオペレーションルーム — 複数のAIエージェントを可視化・制御するPWA。

## コンセプト

> 画面はSFの司令室。複数のAIエージェントが役割に応じて情報を解析し、最終的な提案をまとめる。

- **世界観 × 技術 × PWA** の融合
- Spec-Kitで各AIの役割を定義
- AI同士が協調・会話し、結果を提示

## プロジェクト構造

```
.agent/workflows/     # Antigravityワークフロー
docs/                 # 設計ドキュメント・計画
src/                  # ソースコード（予定）
```

## ワークフローコマンド

| コマンド | 説明 |
|---------|------|
| `/backup` | Giteaにバックアップ |
| `/publish` | GitHubへ公開 |
| `/review-feedback` | 外部AIレビュー結果を取り込む |
| `/export-context` | repomixでエクスポート |
| `/setup-dual-remote` | Dual Remote設定 |

## 開発フロー

詳細は [docs/development_workflow.md](docs/development_workflow.md) を参照。
