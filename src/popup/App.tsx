import { features } from '../features'
import { t } from '../i18n'

export function App() {
  return (
    <main className="w-90 p-4">
      <h1 className="mb-4 px-3 text-xl font-bold">{t('appShortName')}</h1>
      {features.map(({ id, titleKey, Panel }) => (
        <section key={id} aria-labelledby={`feature-${id}`} className="mb-5 last:mb-0">
          <Panel titleId={`feature-${id}`} title={t(titleKey)} />
        </section>
      ))}
    </main>
  )
}
