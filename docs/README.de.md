# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | **Deutsch** | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Chrome-Erweiterung, die nützliche Werkzeuge für den Alltag an einem Ort bündelt. Verfügbar in 13 Sprachen.

![Pop-up](../store-assets/screenshot-light.png)

## Funktionen

### Lesezeichen-Kürzel

- 9 Lesezeichen-Plätze per Tastenkürzel in einem neuen Tab öffnen
- Für jeden Platz ein Lesezeichen wählen oder leer lassen, dann wird das Lesezeichen an derselben Stelle in der Lesezeichenleiste verwendet
- Ist bereits ein Tab mit derselben Adresse geöffnet, wird zu diesem Tab gewechselt
- Standardkürzel für die Plätze 1 bis 4 (auf dem Mac Option+Zahl, sonst Alt+Shift+Zahl). Die Plätze 5 bis 9 werden unter `chrome://extensions/shortcuts` festgelegt

### Aufnahme

- 4 Arten: Ausgewählter Bereich, Seitenelement, Sichtbarer Bereich und Ganze Seite (Pop-up und Kontextmenü)
- Ganze Seiten und lange Elemente werden beim Scrollen in mehreren Teilen aufgenommen und zusammengesetzt, fixierte Kopfzeilen werden ausgeblendet
- Im Editor bearbeiten mit Text, Pfeil, Stift, Form, Mosaik, Unschärfe, Symbol und Zuschneiden
- Als PNG, JPEG oder WebP herunterladen oder in die Zwischenablage kopieren

![Editor](../store-assets/screenshot-editor.png)

## Datenschutz

- Es werden keine Daten an externe Server gesendet
- Aufnahmen werden nur im Browser auf diesem Computer gespeichert und beim Schließen des Editor-Tabs gelöscht
- Die Aufnahmeberechtigung gilt nur für den Tab, in dem das Symbol in der Symbolleiste oder das Kontextmenü angeklickt wurde (`activeTab`)

## Selbst bauen

Benötigt Node.js 20.19 oder neuer

```sh
npm install
npm run build
```

1. `chrome://extensions` in Chrome öffnen
2. Den Entwicklermodus aktivieren
3. Auf Entpackte Erweiterung laden klicken und den Ordner `dist` auswählen

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run check` | Typprüfung, Tests und Build |
| `npm run package` | Erstellt die ZIP-Datei für den Chrome Web Store |

## Technik

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## Lizenz

[MIT](../LICENSE)

Die Lizenzen der enthaltenen Bibliotheken (konva, react-konva, Lucide) stehen in [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
