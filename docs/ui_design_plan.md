# SF風UIデザインシステム構築

## 概要

Aether Console用のSF風（サイバーパンク/司令室）デザインシステムを構築します。

## デザインコンセプト

> **「深宇宙の司令室」** — 暗闘から浮かび上がるシアン/ブルーのネオンライト、
> ホログラム風の半透明パネル、グリッチエフェクト

### カラーパレット

| 役割 | カラー | 用途 |
|------|--------|------|
| **背景** | `#0a0a1a` (Deep Space) | メイン背景 |
| **サブ背景** | `#0f0f2a` | パネル背景 |
| **プライマリ** | `#00ffff` (Cyan) | アクセント、フォーカス |
| **セカンダリ** | `#00aaff` (Blue) | リンク、インタラクティブ |
| **警告** | `#ff6b35` (Orange) | 警告表示 |
| **危険** | `#ff3366` (Red) | エラー、危険 |
| **成功** | `#00ff88` (Green) | 成功、アクティブ |
| **テキスト** | `#e0e0e0` | 本文 |
| **テキスト暗** | `#888888` | サブテキスト |

### エフェクト

1. **グロー効果** — テキストやボーダーにシアンの発光
2. **スキャンライン** — CRT風の水平線オーバーレイ
3. **グリッチ** — テキストのずれ/歪みアニメーション
4. **パネルボーダー** — 角を切り落としたSF風フレーム

---

## Proposed Changes

### デザインシステム基盤

#### [NEW] [global.css](file:///home/gemini1/workspace3/aether-console/src/global.css)
- CSS変数（カラー、スペーシング、タイポグラフィ）
- グローバルリセット
- SF風ユーティリティクラス（`.glow`, `.scanlines`, `.panel`）

#### [MODIFY] [+layout.svelte](file:///home/gemini1/workspace3/aether-console/src/routes/+layout.svelte)
- `global.css`をインポート
- 基本的なページラッパーを追加

---

### コンポーネント

#### [NEW] [Panel.svelte](file:///home/gemini1/workspace3/aether-console/src/lib/components/Panel.svelte)
- SF風のパネルコンポーネント
- 角を切り落としたボーダー
- オプションでヘッダー/タイトル

#### [NEW] [GlitchText.svelte](file:///home/gemini1/workspace3/aether-console/src/lib/components/GlitchText.svelte)
- グリッチエフェクト付きテキスト
- ホバー時にグリッチアニメーション

#### [NEW] [StatusIndicator.svelte](file:///home/gemini1/workspace3/aether-console/src/lib/components/StatusIndicator.svelte)
- AIエージェントのステータス表示用
- パルスアニメーション付き

---

### デモページ

#### [MODIFY] [+page.svelte](file:///home/gemini1/workspace3/aether-console/src/routes/+page.svelte)
- デザインシステムのプレビュー/デモ
- 各コンポーネントの表示確認

---

## Verification Plan

### 開発サーバーでの確認
```bash
npm run dev
```
→ http://localhost:5173/ でデザインシステムのプレビューを確認

### 確認ポイント
1. ダーク背景にシアンのグロー効果が表示されるか
2. Panelコンポーネントの角が切り落とされているか
3. GlitchTextのホバーでグリッチアニメーションが動作するか
4. StatusIndicatorのパルスアニメーションが動作するか
