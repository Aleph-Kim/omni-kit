import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { t } from '../../../../i18n'
import { dragWorkSize, type Size, type WorkMode } from './work'

type Props = { mode: WorkMode; size: Size; area: Size; onSize: (size: Size) => void; onSizeEnd: () => void; children: ReactNode }
type Side = 'width' | 'height' | 'both'

const HANDLES: { side: Side; label: string; className: string }[] = [
  { side: 'width', label: 'resizeWidth', className: 'top-1/2 -right-0.75 h-9 w-1.5 -translate-y-1/2 cursor-ew-resize!' },
  { side: 'height', label: 'resizeHeight', className: 'left-1/2 -bottom-0.75 h-1.5 w-9 -translate-x-1/2 cursor-ns-resize!' },
  { side: 'both', label: 'resizeBoth', className: '-right-1.25 -bottom-1.25 size-2.5 cursor-nwse-resize!' },
]

// 방향키 한 번에 16px (가운데 정렬이라 끈 거리의 2배로 늘어남)
const KEY_STEP = 8
const KEY_DELTA: Record<string, { dx: number; dy: number }> = {
  ArrowRight: { dx: KEY_STEP, dy: 0 },
  ArrowLeft: { dx: -KEY_STEP, dy: 0 },
  ArrowDown: { dx: 0, dy: KEY_STEP },
  ArrowUp: { dx: 0, dy: -KEY_STEP },
}

export function WorkArea({ mode, size, area, onSize, onSizeEnd, children }: Props) {
  const drag = useRef<{ x: number; y: number; size: Size } | null>(null)

  if (mode === 'fill') return <div className="absolute inset-0">{children}</div>

  const move = (side: Side, delta: { dx: number; dy: number }, start: Size) =>
    onSize(dragWorkSize(start, { dx: side === 'height' ? 0 : delta.dx, dy: side === 'width' ? 0 : delta.dy }, area))

  const end = () => {
    if (!drag.current) return
    drag.current = null
    onSizeEnd()
  }

  const keyDown = (side: Side, event: KeyboardEvent) => {
    const delta = KEY_DELTA[event.key]
    if (!delta || (side === 'width' && delta.dx === 0) || (side === 'height' && delta.dy === 0)) return
    event.preventDefault()
    move(side, delta, size)
    onSizeEnd()
  }

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative" style={size}>
        {children}
        {HANDLES.map(({ side, label, className }) => (
          <button
            key={side}
            type="button"
            aria-label={t(label)}
            title={t(label)}
            // 시안의 오른쪽, 아래 손잡이라 실제 좌우로 고정 (가운데 정렬이라 아랍어 화면에서도 양쪽이 같이 늘어남)
            className={`absolute touch-none rounded-full bg-(--ok-accent) before:absolute before:-inset-2 before:content-[''] ${className}`}
            onPointerDown={(event: PointerEvent) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              drag.current = { x: event.clientX, y: event.clientY, size }
            }}
            onPointerMove={(event: PointerEvent) => {
              const start = drag.current
              if (start) move(side, { dx: event.clientX - start.x, dy: event.clientY - start.y }, start.size)
            }}
            onPointerUp={end}
            onLostPointerCapture={end}
            onKeyDown={(event) => keyDown(side, event)}
          />
        ))}
      </div>
    </div>
  )
}
