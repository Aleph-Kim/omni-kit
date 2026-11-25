# OmniKit

**English** | [한국어](docs/README.ko.md) | [日本語](docs/README.ja.md) | [简体中文](docs/README.zh-CN.md) | [繁體中文](docs/README.zh-TW.md) | [Español](docs/README.es.md) | [Português (Brasil)](docs/README.pt-BR.md) | [Deutsch](docs/README.de.md) | [Français](docs/README.fr.md) | [Bahasa Indonesia](docs/README.id.md) | [Tiếng Việt](docs/README.vi.md) | [हिन्दी](docs/README.hi.md) | [العربية](docs/README.ar.md)

Chrome extension that brings everyday browser tools together in one place. Available in 13 languages.

![Popup](store-assets/screenshot-light.png)

## Features

### Bookmark shortcuts

- Open 9 bookmark slots in a new tab with keyboard shortcuts
- Pick a bookmark for each slot, or leave it empty to use the bookmark in the same position on the bookmarks bar
- Switch to the tab if one with the same address is already open
- Default shortcuts for slots 1 to 4 (Option+number on Mac, Alt+Shift+number elsewhere). Set slots 5 to 9 in `chrome://extensions/shortcuts`

### Capture

- 4 modes: Selected area, Page element, Visible part and Full page (popup and right-click menu)
- Full pages and long elements are captured while scrolling and stitched together, with fixed headers hidden
- Edit in the editor with Text, Arrow, Pen, Shape, Mosaic, Blur, Icon and Crop
- Download as PNG, JPEG or WebP, or copy to the clipboard

![Editor](store-assets/screenshot-editor.png)

## Privacy

- No data is sent to external servers
- Screenshots are stored only in the browser on this computer and deleted when the editor tab is closed
- Capture permission applies only to the tab where you clicked the toolbar icon or the right-click menu (`activeTab`)

## Build from source

Requires Node.js 20.19 or later

```sh
npm install
npm run build
```

1. Open `chrome://extensions` in Chrome
2. Turn on Developer mode
3. Click Load unpacked and select the `dist` folder

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Type check, tests and build |
| `npm run package` | Create the zip for the Chrome Web Store |

## Tech stack

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## License

[MIT](LICENSE)

Licenses of the bundled libraries (konva, react-konva, Lucide) are in [public/THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt)
