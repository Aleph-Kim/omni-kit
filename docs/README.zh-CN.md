# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | **简体中文** | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

汇集日常常用功能的 Chrome 扩展程序，支持 13 种语言

[从 Chrome 应用商店安装](https://chromewebstore.google.com/detail/lfjjclkojbgjgjbjjpfippbjbemjmoci)

![弹出窗口](../store-assets/screenshot-light.png)

## 功能

### 书签快捷键

- 使用快捷键在新标签页中打开 9 个书签位
- 可为每个位置选择书签，未选择的位置使用书签栏中相同顺序的书签
- 如果已打开相同网址的标签页，则切换到该标签页
- 默认快捷键用于第 1 到第 4 个位置 (Mac 为 Option+数字，其他系统为 Alt+Shift+数字)，第 5 到第 9 个可在 `chrome://extensions/shortcuts` 中设置

### 截取

- 选定区域、页面元素、可见部分、整个页面 4 种方式 (弹出窗口和右键菜单)
- 整个页面和较长的元素会边滚动边截取多张并拼接，固定页眉会被隐藏
- 在编辑页面中使用文字、箭头、画笔、形状、马赛克、模糊、图标、裁剪进行编辑
- 下载为 PNG、JPEG、WebP，或复制到剪贴板

![编辑页面](../store-assets/screenshot-editor.png)

## 隐私

- 不向外部服务器发送任何数据
- 截图只保存在本机浏览器中，关闭编辑标签页后即删除
- 截取权限仅适用于点击了工具栏图标或右键菜单的标签页 (`activeTab`)

## 从源码构建

需要 Node.js 20.19 或更高版本

```sh
npm install
npm run build
```

1. 在 Chrome 中打开 `chrome://extensions`
2. 开启开发者模式
3. 点击加载已解压的扩展程序，选择 `dist` 文件夹

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run check` | 类型检查、测试、构建 |
| `npm run package` | 生成提交到 Chrome 应用商店的 zip |

## 技术

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## 许可证

[MIT](../LICENSE)

所用库 (konva、react-konva、Lucide) 的许可证见 [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
