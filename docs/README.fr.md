# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | **Français** | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Extension Chrome qui rassemble des outils utiles au quotidien. Disponible en 13 langues.

[Installer depuis le Chrome Web Store](https://chromewebstore.google.com/detail/lfjjclkojbgjgjbjjpfippbjbemjmoci)

![Pop-up](../store-assets/screenshot-light.png)

## Fonctions

### Raccourcis de favoris

- Ouvrir 9 emplacements de favoris dans un nouvel onglet avec des raccourcis clavier
- Choisir un favori pour chaque emplacement ou le laisser vide pour utiliser le favori à la même position dans la barre de favoris
- Si un onglet avec la même adresse est déjà ouvert, passer à cet onglet
- Raccourcis par défaut pour les emplacements 1 à 4 (Option+chiffre sur Mac, Alt+Maj+chiffre ailleurs). Les emplacements 5 à 9 se définissent dans `chrome://extensions/shortcuts`

### Capture

- 4 modes : Zone sélectionnée, Élément de la page, Partie visible et Page entière (pop-up et menu contextuel)
- Les pages entières et les éléments longs sont capturés en faisant défiler la page puis assemblés, les en-têtes fixes sont masqués
- Modifier dans l'éditeur avec Texte, Flèche, Stylo, Forme, Mosaïque, Flou, Icône et Recadrer
- Télécharger en PNG, JPEG ou WebP, ou copier dans le presse-papiers

![Éditeur](../store-assets/screenshot-editor.png)

## Confidentialité

- Aucune donnée n'est envoyée à des serveurs externes
- Les captures sont enregistrées uniquement dans le navigateur de cet ordinateur et supprimées à la fermeture de l'onglet de l'éditeur
- L'autorisation de capture ne s'applique qu'à l'onglet où vous avez cliqué sur l'icône de la barre d'outils ou sur le menu contextuel (`activeTab`)

## Compiler depuis les sources

Nécessite Node.js 20.19 ou une version ultérieure

```sh
npm install
npm run build
```

1. Ouvrir `chrome://extensions` dans Chrome
2. Activer le Mode développeur
3. Cliquer sur Charger l'extension non empaquetée et choisir le dossier `dist`

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run check` | Vérification des types, tests et build |
| `npm run package` | Crée le zip pour le Chrome Web Store |

## Technologies

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## Licence

[MIT](../LICENSE)

Les licences des bibliothèques incluses (konva, react-konva, Lucide) se trouvent dans [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
