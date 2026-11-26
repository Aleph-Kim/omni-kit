import { useEffect, useState, type ReactNode } from 'react'
import { t } from '../../i18n'
import { SectionTitle } from '../../ui/SectionTitle'
import type { CaptureMessage } from './background'
import pageScrollScript from './content/page-scroll.ts?iife'
import { captureBlockReason, captureSupport, frameOriginPattern, isPdf, type CaptureMode, type CaptureSupport } from './shot'

const OPTIONS: { mode: CaptureMode; titleKey: string; hintKey: string; icon: ReactNode }[] = [
  {
    mode: 'area',
    titleKey: 'shotArea',
    hintKey: 'shotAreaHint',
    icon: (
      <>
        <rect className="ok-shot-accent" x="6" y="4" width="28" height="20" rx="1" strokeDasharray="4 3" />
        <path className="ok-shot-stroke" d="M36 20v12M30 26h12" />
      </>
    ),
  },
  {
    mode: 'element',
    titleKey: 'shotElement',
    hintKey: 'shotElementHint',
    icon: (
      <>
        <rect className="ok-shot-block" x="6" y="4" width="36" height="6" rx="1.5" />
        <rect className="ok-shot-accent" x="6" y="13" width="20" height="19" rx="1.5" />
        <rect className="ok-shot-block" x="29" y="13" width="13" height="19" rx="1.5" />
        <path className="ok-shot-pointer" d="M17 17v12l3-3 2.3 4.6 2-1-2.3-4.4H26z" />
      </>
    ),
  },
  {
    mode: 'visible',
    titleKey: 'shotVisible',
    hintKey: 'shotVisibleHint',
    icon: (
      <>
        <rect className="ok-shot-frame" x="6" y="4" width="36" height="22" rx="2.5" />
        <rect className="ok-shot-fill" x="9" y="7" width="30" height="16" rx="1" />
        <path className="ok-shot-stroke" d="M24 26v4M18 31h12" />
      </>
    ),
  },
  {
    mode: 'full',
    titleKey: 'shotFullPage',
    hintKey: 'shotFullPageHint',
    icon: (
      <>
        <rect className="ok-shot-frame" x="13" y="4" width="22" height="28" rx="2" />
        <path className="ok-shot-line" d="M17 9h14M17 13.5h14M17 18h9" />
        <path className="ok-shot-arrow" d="M20 21l4 3.5 4-3.5M20 26l4 3.5 4-3.5" />
      </>
    ),
  },
]

export function CapturePanel({ titleId, title }: { titleId: string; title: string }) {
  const [tabId, setTabId] = useState<number | null>(null)
  const [support, setSupport] = useState<CaptureSupport | null>(null)
  const [hovered, setHovered] = useState<CaptureMode | null>(null)
  const [frameOrigin, setFrameOrigin] = useState<string | null>(null)
  const [pdf, setPdf] = useState(false)
  const [reason, setReason] = useState<ReturnType<typeof captureBlockReason>>(null)

  useEffect(() => {
    // 허용 창 경로는 바로 닫혀서 서비스 워커를 미리 깨움
    chrome.runtime.sendMessage({ type: 'wake' }).catch(() => {})
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const fileAccess = await chrome.extension.isAllowedFileSchemeAccess()
      const support = captureSupport(tab?.url, fileAccess)
      setReason(captureBlockReason(tab?.url, fileAccess))
      setTabId(tab?.id ?? null)
      setPdf(support === 'full' && tab?.id !== undefined && (await isPdf(tab.id)))
      setSupport(support)
      // 권한 요청은 클릭 안에서 바로 해야 해서 미리 확인
      if (support === 'full' && tab?.id !== undefined) setFrameOrigin(await frameNeedingPermission(tab.id))
    })()
  }, [])

  if (!support) return null

  const enabled = (mode: CaptureMode) =>
    tabId !== null && (support === 'full' ? !(pdf && mode === 'full') : support === 'visible' && mode === 'visible')

  // 영역, 요소 고르기 화면이 팝업에 가려지지 않게 요청 후 바로 닫음
  const capture = (mode: CaptureMode) => {
    if (!enabled(mode)) return
    if ((mode !== 'full' && mode !== 'element') || !frameOrigin) {
      // 꺼진 서비스 워커가 켜지는 동안 팝업이 닫히면 메시지가 사라져서 전달된 뒤 닫음
      void chrome.runtime
        .sendMessage({ type: 'capture', mode, tabId: tabId! } satisfies CaptureMessage)
        .finally(() => window.close())
      return
    }
    // 권한 요청은 클릭 안에서만 가능, 허용 창이 뜨면서 팝업이 닫힐 수 있어 찍기 요청을 먼저 보내고 백그라운드가 결과를 기다림
    void chrome.runtime.sendMessage({ type: 'capture', mode, tabId: tabId!, frameOrigin } satisfies CaptureMessage)
    void chrome.permissions
      .request({ origins: [frameOriginPattern(frameOrigin)] })
      .then((granted) => !granted && chrome.runtime.sendMessage({ type: 'frame-permission-denied' } satisfies CaptureMessage))
      .finally(() => window.close())
  }

  const notice = support !== 'full' ? t(support === 'visible' ? 'captureLimited' : 'captureUnavailable') : pdf ? t('captureNoFullPdf') : null
  const hint = !hovered
    ? notice
    : enabled(hovered)
      ? t(OPTIONS.find((option) => option.mode === hovered)!.hintKey)
      : pdf && hovered === 'full'
        ? t('captureNoFullPdf')
        : reason
          ? t(reason)
          : notice

  return (
    <>
      <SectionTitle id={titleId}>{title}</SectionTitle>
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-(--ok-cell) p-1.5">
        {OPTIONS.map(({ mode, titleKey, icon }) => (
          <button
            key={mode}
            type="button"
            aria-disabled={!enabled(mode)}
            className="flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-0.5 pt-2.5 pb-2 not-aria-disabled:hover:bg-(--ok-fill) aria-disabled:cursor-default aria-disabled:opacity-35"
            onClick={() => capture(mode)}
            onPointerEnter={() => setHovered(mode)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(mode)}
            onBlur={() => setHovered(null)}
          >
            <svg viewBox="0 0 48 36" aria-hidden="true" className="h-9 w-12">
              {icon}
            </svg>
            <span className="text-center text-xs leading-tight">{t(titleKey)}</span>
          </button>
        ))}
      </div>
      <p className="mx-3 mt-1.5 min-h-8 text-xs text-(--ok-label-2)">{hint}</p>
    </>
  )
}

/**
 * 내용이 다른 주소의 iframe 안에서만 스크롤되는 페이지면 아직 권한이 없는 그 주소
 */
async function frameNeedingPermission(tabId: number): Promise<string | null> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: [pageScrollScript] })
    const [{ result: frame }] = await chrome.scripting.executeScript({ target: { tabId }, func: () => window.omniKitPageScroll!.findFrame() })
    if (!frame || (await chrome.permissions.contains({ origins: [frameOriginPattern(frame.origin)] }))) return null
    return frame.origin
  } catch {
    return null
  }
}
