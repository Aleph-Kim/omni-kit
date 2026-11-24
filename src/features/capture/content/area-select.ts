import type { Rect } from '../shot'

const HOST_ID = 'omni-kit-area-select'
const SHADE = 'rgb(0 0 0 / 0.3)'

// 넣을 때마다 다시 실행되므로 이미 고르는 중이면 그대로 둠
if (!document.getElementById(HOST_ID)) start()

function start() {
  const host = document.createElement('div')
  host.id = HOST_ID
  host.style.cssText = `all:initial;position:fixed;inset:0;z-index:2147483647;cursor:crosshair;touch-action:none;background:${SHADE}`
  const box = document.createElement('div')
  box.style.cssText = `position:fixed;display:none;outline:1px solid #fff;box-shadow:0 0 0 100vmax ${SHADE}`
  // 페이지 CSS가 고르기 화면에 영향을 주지 않도록 분리
  host.attachShadow({ mode: 'closed' }).append(box)
  document.documentElement.append(host)

  let origin: { x: number; y: number } | null = null
  let rect: Rect = { x: 0, y: 0, width: 0, height: 0 }

  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

  const close = () => {
    host.remove()
    removeEventListener('keydown', onKey, true)
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    close()
  }

  host.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    origin = { x: clamp(event.clientX, innerWidth), y: clamp(event.clientY, innerHeight) }
    host.setPointerCapture(event.pointerId)
  })

  host.addEventListener('pointermove', (event) => {
    if (!origin) return
    const x = clamp(event.clientX, innerWidth)
    const y = clamp(event.clientY, innerHeight)
    rect = { x: Math.min(origin.x, x), y: Math.min(origin.y, y), width: Math.abs(x - origin.x), height: Math.abs(y - origin.y) }
    host.style.background = 'transparent'
    Object.assign(box.style, { display: 'block', left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` })
  })

  host.addEventListener('pointerup', async () => {
    if (!origin) return
    close()
    // 끌지 않고 누르기만 하면 취소
    if (rect.width < 2 || rect.height < 2) return
    // 어두운 막이 화면에서 사라진 뒤에 찍도록 두 프레임 대기
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    await chrome.runtime.sendMessage({ type: 'area-selected', rect, viewportWidth: innerWidth })
  })

  addEventListener('keydown', onKey, true)
}
