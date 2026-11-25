import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { t } from '../../../../i18n'
import type { ImageType } from '../../shot'
import { UI_ICONS } from './icons'
import { MAX_ITEMS } from './limit'
import { Glyph } from './Toolbar'

const TYPES: { type: ImageType; label: string }[] = [
  { type: 'image/png', label: 'PNG' },
  { type: 'image/jpeg', label: 'JPEG' },
  { type: 'image/webp', label: 'WebP' },
]
const RESOLUTIONS = [1, 0.5, 0.25]

const selectClass = 'bg-transparent text-end text-(--ok-label-2) outline-none'

type Props = {
  type: ImageType
  onType: (type: ImageType) => void
  resolution: number
  onResolution: (value: number) => void
  limited: boolean
  onLimit: (limited: boolean) => void
}

export function Settings({ type, onType, resolution, onResolution, limited, onLimit }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [confirmingOff, setConfirmingOff] = useState(false)

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={t('settings')}
        title={t('settings')}
        aria-haspopup="true"
        aria-expanded={open}
        className="grid size-8 cursor-pointer place-items-center rounded-lg bg-(--ok-cell) text-(--ok-accent) hover:bg-(--ok-fill) aria-expanded:ring-2 aria-expanded:ring-(--ok-accent)"
        style={{ anchorName: '--ok-settings' } as CSSProperties}
      >
        <Glyph body={UI_ICONS.settings} />
      </button>
      <div
        id={id}
        popover="auto"
        className="m-0 mt-1 w-64 rounded-xl border-0 bg-(--ok-cell) p-0 text-(--ok-label) shadow-lg ring-1 ring-(--ok-fill)"
        style={{ positionAnchor: '--ok-settings', inset: 'auto', top: 'anchor(bottom)', insetInlineEnd: 'anchor(end)' } as CSSProperties}
        onToggle={(event) => {
          const next = (event.nativeEvent as ToggleEvent).newState === 'open'
          setOpen(next)
          if (!next) setConfirmingOff(false)
        }}
      >
        <Row label={t('format')}>
          <select className={selectClass} value={type} onChange={(event) => onType(event.target.value as ImageType)}>
            {TYPES.map(({ type, label }) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </Row>
        <Row label={t('resolution')}>
          <select className={selectClass} value={resolution} onChange={(event) => onResolution(Number(event.target.value))}>
            {RESOLUTIONS.map((value) => (
              <option key={value} value={value}>
                {value === 1 ? t('original') : `${value * 100}%`}
              </option>
            ))}
          </select>
        </Row>
        <Row label={t('itemLimit', MAX_ITEMS)}>
          <input
            type="checkbox"
            className="size-4 cursor-pointer accent-(--ok-accent)"
            checked={limited}
            onChange={(event) => {
              if (event.target.checked) {
                setConfirmingOff(false)
                onLimit(true)
              } else {
                setConfirmingOff(true)
              }
            }}
          />
        </Row>
        {confirmingOff && (
          <div className="px-3 pb-3">
            <p className="text-xs text-(--ok-label-2)">{t('itemLimitWarning')}</p>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="cursor-pointer rounded-lg bg-(--ok-fill) px-3 py-1.5 text-(--ok-accent)" onClick={() => setConfirmingOff(false)}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg px-3 py-1.5 text-(--ok-destructive) hover:bg-(--ok-fill)"
                onClick={() => {
                  onLimit(false)
                  setConfirmingOff(false)
                }}
              >
                {t('itemLimitTurnOff')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2.5">
      <span className="flex-1">{label}</span>
      {children}
    </label>
  )
}
