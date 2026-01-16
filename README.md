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

## 利用方法

### 1. インストール

```bash
git clone https://github.com/mjurymaru-blip/aether-console.git
cd aether-console
npm install
```

### 2. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く

### 3. APIキー設定

1. 右上の ⚙️ ボタンをクリック
2. Gemini APIキーを入力
3. パスワードを設定して保存

### 4. 機能を使う

| 機能 | 説明 |
|------|------|
| **AI Agent Chat** | 個別エージェントとの対話 |
| **Integrated Proposal** | 複数エージェントの統合分析 |
| **Spec Patcher** | 仕様変更の適用 |
| **Studio連携** | Spec-Flow Studioとの接続 |

## プロジェクト構造

```
src/
├── lib/
│   ├── components/   # UIコンポーネント
│   ├── stores/       # 状態管理
│   ├── types/        # 型定義
│   └── data/         # エージェント定義
├── routes/           # ページ
└── app.html          # HTMLテンプレート
static/               # 静的ファイル
```

> **Note:** `docs/` と `.agent/` はプライベートリポジトリ（Gitea）のみに存在します。

## ビルド

```bash
# 本番ビルド
npm run build

# プレビュー
npm run preview
```

## Spec-Flow Studio連携

Spec-Flow StudioとWebSocketで連携し、仕様変更をリアルタイム同期できます。

```typescript
// 接続先
ws://localhost:3001/api/ws
```

## ライセンス

MIT
