import { t } from '../../../../i18n'

type Props = { count: number; part: number; onPart: (index: number) => void }

export function Parts({ count, part, onPart }: Props) {
  return (
    <div
      role="group"
      dir="ltr"
      aria-label={t('pageSplit', count)}
      title={t('pageSplit', count)}
      className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-xl bg-(--ok-cell) p-1 text-xs text-(--ok-label-2) shadow-lg ring-1 ring-(--ok-fill)"
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-pressed={index === part}
          aria-label={t('partLabel', index + 1)}
          className="min-w-7 cursor-pointer rounded-lg px-2 py-1 hover:bg-(--ok-fill) aria-pressed:bg-(--ok-fill) aria-pressed:text-(--ok-label)"
          onClick={() => onPart(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  )
}
