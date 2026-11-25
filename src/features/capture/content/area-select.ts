import type { Rect } from '../shot'

const HOST_ID = 'omni-kit-area-select'
const SHADE = 'rgb(0 0 0 / 0.3)'

// 넣을 때마다 다시 실행되므로 이미 고르는 중이면 그대로 둠
if (!document.getElementById(HOST_ID)) start()

function start() {
  // iframe 안의 마우스, 키 입력은 바깥 문서로 전달되지 않아 window에서 입력을 받는 페이지(Figma 등)가 반응하지 않음
  const host = document.createElement('iframe')
  host.id = HOST_ID
  host.style.cssText = 'all:initial;position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;border:0;color-scheme:normal'
  document.documentElement.append(host)
  const frameWindow = host.contentWindow!
  const doc = frameWindow.document
  doc.documentElement.style.cssText = 'height:100%'
  doc.body.style.cssText = `margin:0;height:100%;cursor:crosshair;touch-action:none;user-select:none;background:${SHADE}`
  const box = doc.createElement('div')
  box.style.cssText = `position:fixed;display:none;outline:1px solid #fff;box-shadow:0 0 0 100vmax ${SHADE}`
  doc.body.append(box)
  // 키 입력도 바깥 페이지 대신 iframe으로 오게 함
  frameWindow.focus()

  let origin: { x: number; y: number } | null = null
  let rect: Rect = { x: 0, y: 0, width: 0, height: 0 }

  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

  const close = () => host.remove()

  doc.addEventListener('keydown', (event) => {
    event.preventDefault()
    if (event.key === 'Escape') close()
  })

  // 휠이 바깥 문서 스크롤로 넘어가지 않게 막음
  doc.addEventListener('wheel', (event) => event.preventDefault(), { passive: false })

  doc.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    origin = { x: clamp(event.clientX, innerWidth), y: clamp(event.clientY, innerHeight) }
    doc.body.setPointerCapture(event.pointerId)
  })

  doc.addEventListener('pointermove', (event) => {
    if (!origin) return
    const x = clamp(event.clientX, innerWidth)
    const y = clamp(event.clientY, innerHeight)
    rect = { x: Math.min(origin.x, x), y: Math.min(origin.y, y), width: Math.abs(x - origin.x), height: Math.abs(y - origin.y) }
    doc.body.style.background = 'transparent'
    Object.assign(box.style, { display: 'block', left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` })
  })

  doc.addEventListener('pointerup', async () => {
    if (!origin) return
    close()
    // 끌지 않고 누르기만 하면 취소
    if (rect.width < 2 || rect.height < 2) return
    // 어두운 막이 화면에서 사라진 뒤에 찍도록 두 프레임 대기
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    await chrome.runtime.sendMessage({ type: 'area-selected', rect, viewportWidth: innerWidth })
  })
}
