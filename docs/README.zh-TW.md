# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | **繁體中文** | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

集合日常常用功能的 Chrome 擴充功能，支援 13 種語言

[從 Chrome 線上應用程式商店安裝](https://chromewebstore.google.com/detail/lfjjclkojbgjgjbjjpfippbjbemjmoci)

![彈出式視窗](../store-assets/screenshot-light.png)

## 功能

### 書籤快速鍵

- 使用快速鍵在新分頁開啟 9 個書籤欄位
- 可為每個欄位選擇書籤，未選擇的欄位使用書籤列中相同順序的書籤
- 如果已開啟相同網址的分頁，就切換到該分頁
- 預設快速鍵用於第 1 到第 4 個欄位 (Mac 為 Option+數字，其他系統為 Alt+Shift+數字)，第 5 到第 9 個可在 `chrome://extensions/shortcuts` 中設定

### 擷取

- 選取範圍、頁面元素、可見部分、整個頁面 4 種方式 (彈出式視窗和右鍵選單)
- 整個頁面和較長的元素會一邊捲動一邊擷取多張並接合，固定頁首會隱藏
- 在編輯畫面中使用文字、箭頭、畫筆、形狀、馬賽克、模糊、圖示、裁切進行編輯
- 下載為 PNG、JPEG、WebP，或複製到剪貼簿

![編輯畫面](../store-assets/screenshot-editor.png)

## 隱私權

- 不會傳送任何資料到外部伺服器
- 截圖只儲存在這台電腦的瀏覽器中，關閉編輯分頁後即刪除
- 擷取權限只適用於點選工具列圖示或右鍵選單的分頁 (`activeTab`)

## 從原始碼建置

需要 Node.js 20.19 以上版本

```sh
npm install
npm run build
```

1. 在 Chrome 中開啟 `chrome://extensions`
2. 開啟開發人員模式
3. 點選載入未封裝項目，選擇 `dist` 資料夾

| 指令 | 說明 |
|---|---|
| `npm run dev` | 開發伺服器 |
| `npm run check` | 型別檢查、測試、建置 |
| `npm run package` | 製作提交到 Chrome 線上應用程式商店的 zip |

## 技術

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## 授權

[MIT](../LICENSE)

使用的程式庫 (konva、react-konva、Lucide) 的授權請見 [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
