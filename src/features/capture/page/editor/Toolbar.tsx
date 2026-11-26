import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { t, uiDir } from '../../../../i18n'
import { cardPlacement, clampInside, DEFAULT_DOCK, loadDock, saveDock, type Dock, type Placement } from './dock'
import { UI_ICONS } from './icons'
import { holdKeyLabel, TOOL_KEYS } from './keys'
import type { Tool } from './types'

export function Glyph({ body, className = 'size-5' }: { body: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}

const TOOLS: { tool: Tool; label: string; hint: string; icon: string }[] = [
  { tool: 'select', label: 'toolSelect', hint: 'toolSelectHint', icon: UI_ICONS.select },
  { tool: 'text', label: 'toolText', hint: 'toolTextHint', icon: UI_ICONS.text },
  { tool: 'arrow', label: 'toolArrow', hint: 'toolArrowHint', icon: UI_ICONS.arrow },
  { tool: 'pen', label: 'toolPen', hint: 'toolPenHint', icon: UI_ICONS.pen },
  { tool: 'shape', label: 'toolShape', hint: 'toolShapeHint', icon: UI_ICONS.shape },
  { tool: 'mosaic', label: 'toolMosaic', hint: 'toolMosaicHint', icon: UI_ICONS.mosaic },
  { tool: 'blur', label: 'toolBlur', hint: 'toolBlurHint', icon: UI_ICONS.blur },
  { tool: 'icon', label: 'toolIcon', hint: 'toolIconHint', icon: UI_ICONS.icon },
  { tool: 'crop', label: 'toolCrop', hint: 'toolCropHint', icon: UI_ICONS.crop },
]

/**
 * 크롬 기본 도움말(title)은 1초쯤 늦게 떠서 마우스를 올리거나 Tab으로 닿으면 바로 뜨는 말풍선, 버튼에 group relative 필요
 * 떠 있는 도구 줄에서는 속성 카드와 같은 쪽, 아래나 위에 띄울 때는 줄 밖으로 잘리지 않게 시작이나 끝에 맞춤
 */
export function Tip({
  id,
  text,
  note,
  shortcut,
  placement = 'end',
  align = 'end',
}: {
  id: string
  text: string
  note?: string
  shortcut?: string
  placement?: Placement['side']
  align?: Placement['align']
}) {
  const edge = align === 'start' ? 'start-0' : 'end-0'
  const position = {
    end: 'top-1/2 start-full ms-2 -translate-y-1/2',
    start: 'top-1/2 end-full me-2 -translate-y-1/2',
    below: `top-full mt-1 ${edge}`,
    above: `bottom-full mb-1 ${edge}`,
  }[placement]
  return (
    <span
      id={id}
      role="tooltip"
      className={`pointer-events-none invisible absolute z-20 w-max max-w-60 rounded-lg bg-(--ok-cell) px-3 py-2 text-start text-xs font-normal text-(--ok-label) opacity-0 shadow-lg ring-1 ring-(--ok-fill) transition-opacity delay-150 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 ${position}`}
    >
      <span className="flex items-center gap-3">
        <span className="flex-1">{text}</span>
        {shortcut && (
          <kbd dir="ltr" className="rounded bg-(--ok-fill) px-1.5 font-sans text-(--ok-label-2)">
            {shortcut}
          </kbd>
        )}
      </span>
      {note && <span className="mt-1 block text-(--ok-label-2)">{note}</span>}
    </span>
  )
}

export const iconButton = 'grid size-9 shrink-0 place-items-center rounded-lg hover:bg-(--ok-fill) disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent'

type BarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tipId: string
  tip: string
  note?: string
  shortcut?: string
  side: Placement['side']
  align: Placement['align']
  /** 줄 안에서 스크롤될 때는 말풍선이 잘려서 크롬 기본 도움말 */
  plain: boolean
}

function BarButton({ tipId, tip, note, shortcut, side, align, plain, className = '', children, ...button }: BarButtonProps) {
  const title = [shortcut ? `${tip} (${shortcut})` : tip, note].filter(Boolean).join('\n')
  return (
    <button type="button" {...button} title={plain ? title : undefined} aria-describedby={plain ? undefined : tipId} className={`${iconButton} group relative ${className}`}>
      {children}
      {!plain && <Tip id={tipId} text={tip} note={note} shortcut={shortcut} placement={side} align={align} />}
    </button>
  )
}

type Props = {
  tool: Tool
  onTool: (tool: Tool) => void
  zoom: number
  onZoom: (direction: 1 | -1 | 0) => void
  /** 헤더 아래 영역 크기, 도구 줄은 이 안에서만 움직임 */
  area: { width: number; height: number }
  /** 도구 줄 옆에 붙어 다니는 속성 카드 */
  children?: ReactNode
}

const KEY_STEP = 16

export function Toolbar({ tool, onTool, zoom, onZoom, area, children }: Props) {
  const [dock, setDock] = useState<Dock>(DEFAULT_DOCK)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [scrolls, setScrolls] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef(dock)
  dockRef.current = dock
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  useEffect(() => {
    void loadDock().then(setDock)
  }, [])

  useLayoutEffect(() => {
    const nav = navRef.current!
    const observer = new ResizeObserver(() => setSize({ width: nav.offsetWidth, height: nav.offsetHeight }))
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])

  // 영역보다 길어 넘칠 때만 줄 안 스크롤 (overflow가 있으면 말풍선이 잘림)
  useLayoutEffect(() => {
    const card = cardRef.current!
    setScrolls(dock.vertical ? card.scrollHeight > card.clientHeight + 1 : card.scrollWidth > card.clientWidth + 1)
  }, [dock.vertical, dock.collapsed, area])

  // 저장된 자리는 놓은 자리 그대로, 그릴 때만 영역 안으로
  const shown = clampInside(dock, size, area)
  const placement = cardPlacement({ ...shown, ...size }, area, dock.vertical)
  const sign = uiDir() === 'rtl' ? -1 : 1

  const update = (patch: Partial<Dock>) => {
    const next = { ...dockRef.current, ...patch }
    setDock(next)
    void saveDock(next)
  }

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { px: event.clientX, py: event.clientY, ...shown }
  }
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current
    if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const pos = clampInside({ x: start.x + (event.clientX - start.px) * sign, y: start.y + (event.clientY - start.py) }, size, area)
    setDock((current) => ({ ...current, ...pos }))
  }
  // pointerup 뒤에 오는 lostpointercapture와 겹쳐도 한 번만 저장
  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    void saveDock(dockRef.current)
  }
  const moveByKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowLeft: [-KEY_STEP * sign, 0], ArrowRight: [KEY_STEP * sign, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] }[event.key]
    if (!step) return
    event.preventDefault()
    update(clampInside({ x: shown.x + step[0], y: shown.y + step[1] }, size, area))
  }

  // 가로 줄은 앞쪽 절반 버튼의 말풍선을 시작 쪽, 뒤쪽 절반을 끝 쪽에 맞춤
  const tipCount = TOOLS.length + 5
  const tipAt = (index: number) => ({
    side: placement.side,
    align: dock.collapsed ? placement.align : index < tipCount / 2 ? ('start' as const) : ('end' as const),
    plain: scrolls,
  })

  const toolButton = ({ tool: value, label, hint, icon }: (typeof TOOLS)[number], index: number) => (
    <BarButton
      key={value}
      tipId={`tip-${value}`}
      tip={t(hint)}
      note={value === 'select' ? t('holdToMove', holdKeyLabel()) : undefined}
      shortcut={TOOL_KEYS[value]}
      {...tipAt(index)}
      aria-label={t(label)}
      aria-pressed={tool === value}
      className="aria-pressed:bg-(--ok-fill) aria-pressed:text-(--ok-accent)"
      onClick={() => onTool(value)}
    >
      <Glyph body={icon} />
    </BarButton>
  )
  const collapseLabel = t(dock.collapsed ? 'toolbarExpand' : 'toolbarCollapse')
  const current = TOOLS.findIndex((item) => item.tool === tool)
  const overflow = scrolls ? `${dock.vertical ? 'overflow-y-auto' : 'overflow-x-auto'} [scrollbar-width:none]` : ''
  const cardSide = { end: 'start-full ms-2', start: 'end-full me-2', below: 'top-full mt-2', above: 'bottom-full mb-2' }[placement.side]
  const cardAlign = dock.vertical ? (placement.align === 'start' ? 'top-0' : 'bottom-0') : placement.align === 'start' ? 'start-0' : 'end-0'

  return (
    <nav
      ref={navRef}
      className={`absolute z-20 flex w-max ${dock.vertical ? 'flex-col' : ''}`}
      style={{ insetInlineStart: shown.x, top: shown.y, maxWidth: area.width, maxHeight: area.height }}
    >
      <div
        ref={cardRef}
        role="toolbar"
        aria-orientation={dock.vertical ? 'vertical' : 'horizontal'}
        className={`flex min-h-0 min-w-0 gap-0.5 rounded-xl bg-(--ok-cell) p-1 shadow-lg ring-1 ring-(--ok-fill) ${dock.vertical ? 'flex-col' : 'items-center'} ${overflow}`}
      >
        <button
          type="button"
          aria-label={t('toolbarMove')}
          className={`grid shrink-0 cursor-grab! touch-none place-items-center rounded-lg text-(--ok-label-3) ${dock.vertical ? 'h-5 w-9' : 'h-9 w-5'}`}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onLostPointerCapture={endDrag}
          onKeyDown={moveByKey}
        >
          <Glyph body={UI_ICONS.grip} className="size-4" />
        </button>
        {dock.collapsed ? (
          toolButton(TOOLS[current], 0)
        ) : (
          <>
            {TOOLS.map(toolButton)}
            <BarButton tipId="tip-zoomOut" tip={t('zoomOut')} shortcut="−" {...tipAt(TOOLS.length)} aria-label={t('zoomOut')} onClick={() => onZoom(-1)}>
              <Glyph body={UI_ICONS.zoomOut} />
            </BarButton>
            <span dir="ltr" className="w-9 shrink-0 py-1 text-center text-[11px] text-(--ok-label-2)">
              {Math.round(zoom * devicePixelRatio * 100)}%
            </span>
            <BarButton tipId="tip-zoomIn" tip={t('zoomIn')} shortcut="+" {...tipAt(TOOLS.length + 1)} aria-label={t('zoomIn')} onClick={() => onZoom(1)}>
              <Glyph body={UI_ICONS.zoomIn} />
            </BarButton>
            <BarButton tipId="tip-zoomFit" tip={t('zoomFit')} shortcut="0" {...tipAt(TOOLS.length + 2)} aria-label={t('zoomFit')} onClick={() => onZoom(0)}>
              <Glyph body={UI_ICONS.zoomFit} />
            </BarButton>
            <BarButton
              tipId="tip-rotate"
              tip={t(dock.vertical ? 'toolbarHorizontal' : 'toolbarVertical')}
              {...tipAt(TOOLS.length + 3)}
              aria-label={t(dock.vertical ? 'toolbarHorizontal' : 'toolbarVertical')}
              onClick={() => update({ vertical: !dockRef.current.vertical })}
            >
              <Glyph body={UI_ICONS.rotate} />
            </BarButton>
          </>
        )}
        <BarButton
          tipId="tip-collapse"
          tip={collapseLabel}
          {...tipAt(TOOLS.length + 4)}
          aria-label={collapseLabel}
          aria-expanded={!dock.collapsed}
          onClick={() => update({ collapsed: !dockRef.current.collapsed })}
        >
          <Glyph body={dock.collapsed ? UI_ICONS.chevronDown : UI_ICONS.chevronUp} />
        </BarButton>
      </div>
      <div className={`absolute z-10 flex w-64 flex-col ${cardSide} ${cardAlign}`} style={{ maxHeight: placement.maxHeight }}>
        {children}
      </div>
    </nav>
  )
}
