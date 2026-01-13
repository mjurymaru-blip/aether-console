# 技術スタック選定

## 決定事項

| 項目 | 選択 | 理由 |
|------|------|------|
| **フレームワーク** | SvelteKit | 軽量、リアクティブ、アニメーション得意、新技術への挑戦 |
| **ビルドツール** | Vite | SvelteKit標準、高速 |
| **スタイリング** | Vanilla CSS | SF風UIのフルコントロール |
| **デプロイ** | GitHub Pages | 既存ワークフロー活用、無料 |
| **PWA** | vite-plugin-pwa | Service Worker自動生成 |

## プロジェクトの特性

- **SF風司令室UI** — 複数パネル、グリッチ/スキャンライン等のエフェクト
- **複数AIエージェント** — 状態管理、リアルタイム更新
- **PWA** — オフライン対応、インストール可能
- **仕様駆動開発の実験** — AI主体でのコード生成

## 将来の拡張

- バックエンドが必要になった場合 → Vercel/Cloudflare Pages への移行を検討
- Spec-Flow Studio との連携 → 同一技術スタックで統一
- **Phase 2**: スキーマ検証に `zod` または `valibot` を導入検討
  - 「仕様が壊れたときにどう壊れたか」をUIに表示可能に
- **将来**: テーマモード切替（`--theme-mode: ops | design`）
  - Aether = 派手（ops）、Spec-Flow = 抑制（design）

## 参考

- [SvelteKit公式](https://kit.svelte.dev/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
