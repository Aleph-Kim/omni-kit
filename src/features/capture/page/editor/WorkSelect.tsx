import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { t } from '../../../../i18n'
import { Chevron } from '../../../../ui/Chevron'
import { STAMP_ICONS } from './icons'
import { Glyph } from './Toolbar'
import type { WorkMode } from './work'

type Props = { value: WorkMode; onChange: (mode: WorkMode) => void }

const OPTIONS: { mode: WorkMode; label: string }[] = [
  { mode: 'fill', label: 'workAreaFill' },
  { mode: 'resize', label: 'workAreaResize' },
]

const ANCHOR = '--ok-work-select'

export function WorkSelect({ value, onChange }: Props) {
  const id = useId()
  const titleId = `${id}-title`
  const list = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const current = OPTIONS.find((option) => option.mode === value) ?? OPTIONS[0]

  const choose = (mode: WorkMode) => {
    onChange(mode)
    list.current!.hidePopover()
  }

  const buttonKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    list.current!.showPopover()
  }

  const listKeyDown = (event: KeyboardEvent) => {
    // Tab은 닫기만 하고 초점 이동은 브라우저에 맡김, Esc는 popover가 직접 닫음
    if (event.key === 'Tab') return list.current!.hidePopover()
    if (event.key === 'Escape') return
    event.preventDefault()
    if (event.key === 'ArrowDown') setActive((index) => Math.min(OPTIONS.length - 1, index + 1))
    else if (event.key === 'ArrowUp') setActive((index) => Math.max(0, index - 1))
    else if (event.key === 'Enter' || event.key === ' ') choose(OPTIONS[active].mode)
  }

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${t('workArea')}: ${t(current.label)}`}
        onKeyDown={buttonKeyDown}
        style={{ anchorName: ANCHOR }}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--ok-cell) px-3 py-1.5 text-(--ok-label) hover:bg-(--ok-fill) aria-expanded:ring-2 aria-expanded:ring-(--ok-accent)"
      >
        {t(current.label)}
        <Chevron open />
      </button>
      <div
        ref={list}
        id={id}
        popover="auto"
        role="listbox"
        tabIndex={-1}
        aria-labelledby={titleId}
        aria-activedescendant={`${id}-${OPTIONS[active].mode}`}
        onToggle={(event) => {
          const opened = event.newState === 'open'
          setOpen(opened)
          if (!opened) return
          setActive(OPTIONS.indexOf(current))
          list.current!.focus()
        }}
        onKeyDown={listKeyDown}
        style={{ positionAnchor: ANCHOR, inset: 'auto', top: 'anchor(bottom)', insetInlineEnd: 'anchor(end)' }}
        className="m-0 mt-1 min-w-32 rounded-xl border-0 bg-(--ok-cell) p-1 text-(--ok-label) shadow-lg ring-1 ring-(--ok-fill) outline-none"
      >
        <div id={titleId} role="presentation" className="px-3 py-1 text-xs text-(--ok-label-3)">
          {t('workArea')}
        </div>
        {OPTIONS.map((option, index) => (
          <div
            key={option.mode}
            id={`${id}-${option.mode}`}
            role="option"
            aria-selected={option.mode === value}
            onClick={() => choose(option.mode)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-(--ok-fill) ${option.mode === value || index === active ? 'bg-(--ok-fill)' : ''}`}
          >
            {option.mode === value ? <Glyph body={STAMP_ICONS.check} className="size-4 text-(--ok-accent)" /> : <span className="size-4" />}
            {t(option.label)}
          </div>
        ))}
      </div>
    </>
  )
}
