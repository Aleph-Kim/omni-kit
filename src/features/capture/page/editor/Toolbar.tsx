import { t } from '../../../../i18n'
import { UI_ICONS } from './icons'
import { TOOL_KEYS } from './keys'
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
 * 도구 줄은 넓은 창에서 옆, 좁은 창에서 아래(도구 줄이 가로), 오른쪽 칸 버튼은 화면 끝이라 아래에 끝 쪽을 맞춰 띄움
 */
export function Tip({ id, text, shortcut, placement = 'side' }: { id: string; text: string; shortcut?: string; placement?: 'side' | 'below' }) {
  const position = placement === 'side' ? 'top-full start-0 mt-2 lg:top-1/2 lg:start-full lg:mt-0 lg:ms-2 lg:-translate-y-1/2' : 'top-full end-0 mt-1'
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
    </span>
  )
}

export const iconButton = 'grid size-9 shrink-0 place-items-center rounded-lg hover:bg-(--ok-fill) disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent'

type Props = {
  tool: Tool
  onTool: (tool: Tool) => void
  zoom: number
  onZoom: (direction: 1 | -1 | 0) => void
}

export function Toolbar({ tool, onTool, zoom, onZoom }: Props) {
  return (
    <nav className="flex shrink-0 flex-wrap gap-4 lg:w-11 lg:flex-col">
      <div role="toolbar" aria-orientation="vertical" className="flex flex-wrap gap-0.5 rounded-xl bg-(--ok-cell) p-1 lg:flex-col">
        {TOOLS.map(({ tool: value, label, hint, icon }) => (
          <button
            key={value}
            type="button"
            aria-label={t(label)}
            aria-describedby={`tip-${value}`}
            aria-pressed={tool === value}
            className={`${iconButton} group relative aria-pressed:bg-(--ok-fill) aria-pressed:text-(--ok-accent)`}
            onClick={() => onTool(value)}
          >
            <Glyph body={icon} />
            <Tip id={`tip-${value}`} text={t(hint)} shortcut={TOOL_KEYS[value]} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-xl bg-(--ok-cell) p-1 lg:flex-col">
        <button type="button" aria-label={t('zoomIn')} className={`${iconButton} group relative`} onClick={() => onZoom(1)}>
          <Glyph body={UI_ICONS.zoomIn} />
          <Tip id="tip-zoomIn" text={t('zoomIn')} shortcut="+" />
        </button>
        <button type="button" aria-label={t('zoomOut')} className={`${iconButton} group relative`} onClick={() => onZoom(-1)}>
          <Glyph body={UI_ICONS.zoomOut} />
          <Tip id="tip-zoomOut" text={t('zoomOut')} shortcut="−" />
        </button>
        <button type="button" aria-label={t('zoomFit')} className={`${iconButton} group relative`} onClick={() => onZoom(0)}>
          <Glyph body={UI_ICONS.zoomFit} />
          <Tip id="tip-zoomFit" text={t('zoomFit')} shortcut="0" />
        </button>
        <span dir="ltr" className="w-9 py-1 text-center text-[11px] text-(--ok-label-2)">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </nav>
  )
}
