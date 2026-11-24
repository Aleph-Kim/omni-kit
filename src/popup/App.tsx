import { features } from '../features'

const t = (key: string) => chrome.i18n.getMessage(key) || key

export function App() {
  return (
    <main className="w-80 p-4">
      <h1 className="mb-3 text-base font-semibold">{t('appShortName')}</h1>
      {features.length === 0 ? (
        <p className="text-sm text-(--ok-label-2)">{t('popupEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {features.map((feature) => (
            <li key={feature.id} className="rounded-md bg-(--ok-fill) px-3 py-2 text-sm">
              {t(feature.titleKey)}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
