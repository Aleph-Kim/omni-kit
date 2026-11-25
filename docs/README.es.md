# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | **Español** | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Extensión de Chrome que reúne herramientas útiles para el día a día. Disponible en 13 idiomas.

[Instalar desde Chrome Web Store](https://chromewebstore.google.com/detail/lfjjclkojbgjgjbjjpfippbjbemjmoci)

![Ventana emergente](../store-assets/screenshot-light.png)

## Funciones

### Atajos de marcadores

- Abre 9 espacios de marcadores en una pestaña nueva con atajos de teclado
- Elige un marcador para cada espacio o déjalo vacío para usar el marcador en la misma posición de la barra de marcadores
- Si ya hay una pestaña abierta con la misma dirección, cambia a esa pestaña
- Atajos predeterminados para los espacios 1 a 4 (Option+número en Mac, Alt+Shift+número en otros sistemas). Los espacios 5 a 9 se configuran en `chrome://extensions/shortcuts`

### Captura

- 4 modos: Área seleccionada, Elemento de la página, Parte visible y Página completa (ventana emergente y menú contextual)
- Las páginas completas y los elementos largos se capturan mientras se desplaza la página y se unen en una sola imagen, ocultando los encabezados fijos
- Edita en el editor con Texto, Flecha, Lápiz, Forma, Mosaico, Desenfoque, Icono y Recortar
- Descarga en PNG, JPEG o WebP, o copia al portapapeles

![Editor](../store-assets/screenshot-editor.png)

## Privacidad

- No se envían datos a servidores externos
- Las capturas se guardan solo en el navegador de este equipo y se eliminan al cerrar la pestaña del editor
- El permiso de captura solo se aplica a la pestaña en la que hiciste clic en el icono de la barra de herramientas o en el menú contextual (`activeTab`)

## Compilar desde el código fuente

Requiere Node.js 20.19 o posterior

```sh
npm install
npm run build
```

1. Abre `chrome://extensions` en Chrome
2. Activa el Modo de desarrollador
3. Haz clic en Cargar descomprimida y selecciona la carpeta `dist`

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Comprobación de tipos, pruebas y compilación |
| `npm run package` | Crea el zip para Chrome Web Store |

## Tecnología

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## Licencia

[MIT](../LICENSE)

Las licencias de las bibliotecas incluidas (konva, react-konva, Lucide) están en [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
