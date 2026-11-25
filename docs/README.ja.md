# OmniKit

[English](../README.md) | [한국어](README.ko.md) | **日本語** | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Chromeでよく使う機能をひとつにまとめたChrome拡張機能。13言語に対応

![ポップアップ](../store-assets/screenshot-light.png)

## 機能

### ブックマークショートカット

- ショートカットキーで9つのブックマーク枠を新しいタブで開く
- 枠ごとにブックマークを選ぶか、選ばない枠はブックマークバーの同じ順番のブックマークを使用
- 同じアドレスのタブがすでに開いていれば、そのタブに移動
- 初期ショートカットは1番から4番の枠 (MacはOption+数字、それ以外はAlt+Shift+数字)。5番から9番は `chrome://extensions/shortcuts` で設定

### キャプチャ

- 選択範囲、ページ内の要素、表示部分、ページ全体の4つの方法 (ポップアップと右クリックメニュー)
- ページ全体や長い要素はスクロールしながら複数枚を撮ってつなぎ合わせ、固定ヘッダーは非表示
- 編集画面でテキスト、矢印、ペン、図形、モザイク、ぼかし、アイコン、切り抜きを使って編集
- PNG、JPEG、WebPでダウンロード、クリップボードにコピー

![編集画面](../store-assets/screenshot-editor.png)

## プライバシー

- 外部サーバーへ送信するデータはありません
- 撮った画像はこのパソコンのブラウザ内にだけ保存し、編集タブを閉じると削除
- キャプチャの権限はツールバーアイコンや右クリックメニューを押したタブにだけ適用 (`activeTab`)

## ソースからビルド

Node.js 20.19以上が必要

```sh
npm install
npm run build
```

1. Chromeで `chrome://extensions` を開く
2. デベロッパーモードをオンにする
3. パッケージ化されていない拡張機能を読み込むを押して `dist` フォルダを選択

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run check` | 型チェック、テスト、ビルド |
| `npm run package` | ストア提出用のzipを作成 |

## 技術

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## ライセンス

[MIT](../LICENSE)

使用しているライブラリ (konva、react-konva、Lucide) のライセンスは [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
