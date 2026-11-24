import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: '__MSG_appName__',
  description: '__MSG_appDesc__',
  default_locale: 'en',
  minimum_chrome_version: '128',
  version: pkg.version,
  action: {
    default_title: '__MSG_actionTitle__',
    default_popup: 'popup.html',
  },
  background: { service_worker: 'src/background/index.ts', type: 'module' },
  permissions: ['storage'],
})
