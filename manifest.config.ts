import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }
import { SLOT_COUNT, commandName } from './src/features/bookmark-shortcuts/slots.ts'

// 크롬은 기본 단축키를 4개까지만 허용, 나머지 칸은 사용자가 chrome://extensions/shortcuts 에서 지정
const SUGGESTED_KEY_LIMIT = 4

const bookmarkCommands = Object.fromEntries(
  Array.from({ length: SLOT_COUNT }, (_, index) => [
    commandName(index),
    {
      description: `__MSG_openBookmark${index + 1}__`,
      ...(index < SUGGESTED_KEY_LIMIT && {
        // Mac은 Option+숫자, 그 외는 Alt+Shift+숫자
        suggested_key: { default: `Alt+Shift+${index + 1}`, mac: `Alt+${index + 1}` },
      }),
    },
  ]),
)

// 스토어용 zip(npm run package)만 release, 직접 로드하는 dist는 출시 버전과 구분되게 이름에 DEV
export default defineManifest(({ mode }) => ({
  manifest_version: 3,
  name: mode === 'release' ? '__MSG_appName__' : 'OmniKit DEV',
  description: '__MSG_appDesc__',
  homepage_url: 'https://github.com/Aleph-Kim/omni-kit',
  default_locale: 'en',
  minimum_chrome_version: '128',
  icons: { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' },
  version: pkg.version,
  action: {
    default_title: '__MSG_actionTitle__',
    default_icon: { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png' },
    default_popup: 'popup.html',
  },
  background: { service_worker: 'src/background/index.ts', type: 'module' },
  permissions: ['storage', 'bookmarks', 'favicon', 'tabs', 'activeTab', 'scripting', 'contextMenus'],
  // 내용이 다른 주소의 iframe 안에 있는 페이지를 전체 페이지로 찍을 때만 그 주소를 요청 (설치 화면에는 경고 없음)
  optional_host_permissions: ['http://*/*', 'https://*/*'],
  commands: bookmarkCommands,
  // 페이지에 넣는 코드(?iife)의 주소를 실행마다 바꿔 웹사이트가 확장 설치 여부를 알아내지 못하게 함
  web_accessible_resources: [
    { matches: ['http://*/*', 'https://*/*'], resources: ['<dynamic_resource>'], use_dynamic_url: true },
  ],
}))
