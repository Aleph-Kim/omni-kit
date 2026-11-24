import { useEffect, useState } from 'react'
import { t } from '../../i18n'
import { Chevron } from '../../ui/Chevron'
import type { CaptureMessage } from './background'
import { captureSupport, type CaptureMode, type CaptureSupport } from './shot'

const OPTIONS: { mode: CaptureMode; titleKey: string }[] = [
  { mode: 'area', titleKey: 'shotArea' },
  { mode: 'visible', titleKey: 'shotVisible' },
  { mode: 'full', titleKey: 'shotFullPage' },
]

export function CapturePanel() {
  const [tabId, setTabId] = useState<number | null>(null)
  const [support, setSupport] = useState<CaptureSupport | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      setTabId(tab?.id ?? null)
      setSupport(captureSupport(tab?.url, await chrome.extension.isAllowedFileSchemeAccess()))
    })()
  }, [])

  if (!support) return null

  const enabled = (mode: CaptureMode) => tabId !== null && (support === 'full' || (support === 'visible' && mode === 'visible'))

  // 영역 고르기 화면이 팝업에 가려지지 않게 요청 후 바로 닫음
  const capture = (mode: CaptureMode) => {
    void chrome.runtime.sendMessage({ type: 'capture', mode, tabId: tabId! } satisfies CaptureMessage)
    window.close()
  }

  return (
    <div className="overflow-hidden rounded-xl bg-(--ok-cell)">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-(--ok-fill)"
        onClick={() => setOpen(!open)}
      >
        <ScreenshotIcon />
        <span className="flex-1">{t('screenshot')}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2 px-3 pb-3 ps-10">
          <ul>
            {OPTIONS.map(({ mode, titleKey }) => (
              <li key={mode}>
                <button
                  type="button"
                  disabled={!enabled(mode)}
                  className="flex w-full rounded-lg px-2 py-1.5 text-start enabled:hover:bg-(--ok-fill) disabled:cursor-default disabled:text-(--ok-label-2)"
                  onClick={() => capture(mode)}
                >
                  {t(titleKey)}
                </button>
              </li>
            ))}
          </ul>
          {support !== 'full' && (
            <p className="px-2 text-xs text-(--ok-label-2)">{t(support === 'visible' ? 'captureLimited' : 'captureUnavailable')}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ScreenshotIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 translate-y-px text-(--ok-label-2)">
      <path
        d="M1.5 5V3.5a2 2 0 0 1 2-2H5M11 1.5h1.5a2 2 0 0 1 2 2V5M14.5 11v1.5a2 2 0 0 1-2 2H11M5 14.5H3.5a2 2 0 0 1-2-2V11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
