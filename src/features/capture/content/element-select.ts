import { t, uiDir } from '../../../i18n'
import type { Rect } from '../shot'
import { PICKED_ATTR, placeInFrames, type FrameBox, type PickedFrame } from './frames'

const HOST_ID = 'omni-kit-element-select'
const SHADE = 'rgb(0 0 0 / 0.3)'
const ACCENT = '#007aff'
// 트랙패드는 한 번 쓸어도 휠 입력이 여러 번 들어와서 이어지는 입력은 이만큼 모였을 때 한 단계
const WHEEL_STEP = 60
// 이만큼 쉬었다 들어온 휠 입력은 바로 한 단계 (마우스 휠 한 칸은 몇 px뿐이라 모으면 여러 칸을 굴려야 함)
const WHEEL_PAUSE = 150

declare global {
  interface Window {
    // 고른 요소, 같은 확장의 콘텐츠 스크립트끼리 window를 같이 써서 page-scroll이 이어받음
    omniKitPickedElement?: Element
  }
}

// 고르기 화면은 웹페이지 스타일과 섞이지 않는 iframe 안이라 테마 변수 없이 직접 지정
const STYLE = `
  :root { height: 100%; font: 500 12px -apple-system, BlinkMacSystemFont, system-ui, sans-serif; color: #fff }
  body { margin: 0; height: 100%; cursor: default; touch-action: none; user-select: none }
  .box { position: fixed; display: none; outline: 2px solid ${ACCENT}; box-shadow: 0 0 0 100vmax ${SHADE} }
  .zoom .box, .zoom .label { transition: left 0.15s ease-out, top 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out }
  .label, .guide { position: fixed; pointer-events: none; display: flex; flex-direction: column; gap: 6px }
  .label { display: none; padding: 6px 8px; border-radius: 8px; background: ${ACCENT}; box-shadow: 0 2px 8px rgb(0 0 0 / 0.3) }
  .guide { bottom: 24px; left: 50%; transform: translateX(-50%); padding: 14px 18px; border-radius: 12px; background: rgb(0 0 0 / 0.85); border: 1px solid rgb(255 255 255 / 0.2); box-shadow: 0 4px 16px rgb(0 0 0 / 0.3); font-size: 13px }
  .guide-body { display: flex; align-items: center; gap: 16px }
  .label-rows { display: grid; grid-template-columns: auto auto; align-items: center; gap: 6px 10px }
  .label-rows .row { display: contents }
  .title { font-weight: 600; font-size: 14px }
  .row { display: flex; align-items: center; gap: 8px; white-space: nowrap }
  .keys { display: flex; gap: 6px }
  .warn { white-space: normal; max-width: 320px }
  kbd { display: inline-block; min-width: 1.6em; padding: 1px 5px; border-radius: 5px; background: rgb(255 255 255 / 0.2); font: inherit; font-weight: 600; text-align: center; transition: transform 0.1s, background 0.1s, color 0.1s }
  .pressed kbd, kbd.pressed { background: rgb(255 255 255 / 0.45); transform: scale(1.08) }
`

// 안쪽 요소(파랑)를 감싸는 바깥 요소(점선) 그림으로 넓히기, 좁히기 개념을 보여 줌
const NESTED_ICON = `<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
  <rect x="4" y="4" width="56" height="56" rx="6" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="18" y="22" width="28" height="22" rx="4" fill="${ACCENT}" fill-opacity="0.35" stroke="${ACCENT}" stroke-width="2"/>
  <path d="M32 18V8M28 12l4-4 4 4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// 넣을 때마다 다시 실행되므로 이미 고르는 중이면 그대로 둠
if (!document.getElementById(HOST_ID)) start()

function start() {
  // 영역 고르기와 같은 이유로 입력을 iframe이 받아 바깥 페이지가 반응하지 않게 함
  const host = document.createElement('iframe')
  host.id = HOST_ID
  host.style.cssText = 'all:initial;position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;border:0;color-scheme:normal'
  document.documentElement.append(host)
  const frameWindow = host.contentWindow!
  const doc = frameWindow.document
  doc.documentElement.dir = uiDir()
  const style = doc.createElement('style')
  style.textContent = STYLE
  doc.head.append(style)

  const element = (className: string, html = '') => Object.assign(doc.createElement('div'), { className, innerHTML: html })
  // 키 모양 표시, 아랍어 화면에서도 화살표와 글자 순서가 뒤집히지 않게 ltr
  // dir: 휠과 화살표 입력이 들어오면 같은 방향의 키 표시를 반짝이게 하는 표시
  const kbd = (text: string, dir = '') => `<kbd dir="ltr"${dir && ` data-dir="${dir}"`}>${escapeHtml(text)}</kbd>`
  const row = (keys: string[], text: string, dir = '') =>
    `<div class="row"${dir && ` data-dir="${dir}"`}><span class="keys">${keys.map((key) => kbd(key)).join('')}</span><span>${escapeHtml(text)}</span></div>`

  const box = element('box')
  const label = element('label')
  const rows = [
    row(['↑', t('pickWheelUp')], t('pickWider'), 'up'),
    row(['↓', t('pickWheelDown')], t('pickNarrower'), 'down'),
    row([t('pickClick')], t('pickCapture')),
    row(['Esc'], t('pickCancel')),
  ]
  const guide = element(
    'guide',
    `<div class="title">${escapeHtml(t('pickTitle'))}</div><div class="guide-body">${NESTED_ICON}<div class="label-rows">${rows.join('')}</div></div>`,
  )
  doc.body.append(box, label, guide)
  frameWindow.focus()

  // chain[0]은 마우스 아래 요소, 뒤로 갈수록 바깥 요소
  let chain: Element[] = []
  let level = 0
  let wheel = 0
  let lastWheel = -Infinity
  let pressed = false

  const close = () => host.remove()

  // 상자 위에 지금 쓸 수 있는 키만 보여 주는 라벨, 위에 자리가 없으면 상자 안쪽 위
  const draw = () => {
    const el = chain[level]
    if (!el) return
    const rect = screenRect(el)
    Object.assign(box.style, { display: 'block', left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` })
    const keys = [
      ...(level + 1 < chain.length || parentOf(el) ? [`${kbd('↑', 'up')} ${escapeHtml(t('pickWiderShort'))}`] : []),
      ...(level > 0 ? [`${kbd('↓', 'down')} ${escapeHtml(t('pickNarrowerShort'))}`] : []),
      `${kbd(t('pickClick'))} ${escapeHtml(t('pickCapture'))}`,
    ]
    // canvas(Figma 디자인 화면, 차트 등)와 다른 주소의 iframe은 안쪽을 고를 수 없어 찍기 전에 알림
    // iframe 안 요소는 instanceof가 맞지 않아 태그 이름으로 판별
    const warnKey = el.localName === 'canvas' ? 'elementPickCanvas' : isFrame(el) && !frameDocument(el) ? 'elementPickFrame' : ''
    const warn = warnKey ? `<div class="warn">${escapeHtml(t(warnKey))}</div>` : ''
    label.innerHTML = `${warn}<div class="row">${keys.join('&nbsp;&nbsp;')}</div>`
    label.style.display = 'flex'
    const { width, height } = label.getBoundingClientRect()
    const above = rect.y - height - 6
    const top = above >= 8 ? above : Math.max(8, rect.y + 6)
    label.style.top = `${Math.min(top, innerHeight - height - 8)}px`
    label.style.left = `${Math.max(8, Math.min(rect.x, innerWidth - width - 8))}px`
  }

  const hover = (x: number, y: number) => {
    let el = document.elementsFromPoint(x, y).find((el) => el !== host)
    // 같은 출처 iframe은 안쪽 문서로 내려가 그 안의 요소를 고름, 안쪽에서 못 찾으면 iframe 그대로
    for (let inner = el && frameDocument(el); el && inner; inner = frameDocument(el)) {
      const box = frameBox(el)
      x = (x - box.x) / box.scale
      y = (y - box.y) / box.scale
      const found = inner.elementFromPoint(x, y)
      if (!found) break
      el = found
    }
    if (!el || el === chain[0]) return
    doc.body.classList.remove('zoom')
    chain = [el]
    level = 0
    draw()
  }

  // 휠과 화살표 키로 바꿀 때만 상자가 부드럽게 커지고 줄어 바뀐 것이 보이게 함, 마우스로 옮길 때는 바로 따라감
  const outer = () => {
    doc.body.classList.add('zoom')
    if (level + 1 < chain.length) level++
    else {
      const parent = chain[level] && parentOf(chain[level])
      if (!parent) return
      chain.push(parent)
      level++
    }
    draw()
  }

  const inner = () => {
    doc.body.classList.add('zoom')
    level = Math.max(0, level - 1)
    draw()
  }

  const select = async () => {
    const el = chain[level]
    if (!el) return
    close()
    let frame: PickedFrame | undefined
    if (el.ownerDocument === document) window.omniKitPickedElement = el
    else {
      el.setAttribute(PICKED_ATTR, '')
      frame = { ...framePlace(el), viewportWidth: innerWidth }
    }
    // 어두운 막이 화면에서 사라진 뒤에 찍도록 두 프레임 대기
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    await chrome.runtime.sendMessage({ type: 'element-selected', frame })
  }

  // 입력을 받았다는 것이 보이게 같은 방향의 키 표시를 잠깐 강조, 더 넓히거나 좁힐 수 없을 때도 반응
  let flashTimer: ReturnType<typeof setTimeout> | undefined
  const flash = (dir: 'up' | 'down') => {
    clearTimeout(flashTimer)
    for (const el of doc.querySelectorAll('.pressed')) el.classList.remove('pressed')
    for (const el of doc.querySelectorAll(`[data-dir="${dir}"]`)) el.classList.add('pressed')
    flashTimer = setTimeout(() => doc.querySelectorAll('.pressed').forEach((el) => el.classList.remove('pressed')), 200)
  }

  doc.addEventListener('keydown', (event) => {
    event.preventDefault()
    if (event.key === 'Escape') close()
    else if (event.key === 'ArrowUp') {
      outer()
      flash('up')
    } else if (event.key === 'ArrowDown') {
      inner()
      flash('down')
    }
    else if (event.key === 'Enter') void select()
  })

  doc.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault()
      if (!event.deltaY) return
      const fresh = event.timeStamp - lastWheel > WHEEL_PAUSE
      lastWheel = event.timeStamp
      wheel = fresh ? Math.sign(event.deltaY) * WHEEL_STEP : wheel + event.deltaY
      if (Math.abs(wheel) >= WHEEL_STEP) {
        if (wheel < 0) outer()
        else inner()
        wheel = 0
      }
      // 라벨은 단계가 바뀌면 다시 그려져서 그 뒤에 강조
      flash(event.deltaY < 0 ? 'up' : 'down')
    },
    { passive: false },
  )

  doc.addEventListener('pointermove', (event) => hover(event.clientX, event.clientY))

  // 누를 때 닫으면 떼는 입력이 바깥 페이지(링크 등)로 가서 뗄 때 고름
  doc.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    pressed = true
    hover(event.clientX, event.clientY)
  })

  doc.addEventListener('pointerup', () => {
    if (pressed) void select()
  })
}

// 크기가 거의 같은 감싸는 요소와 크기가 0인 껍데기(Figma 등)는 건너뛰어 한 단계마다 상자가 눈에 띄게 달라지게 함
function parentOf(el: Element): Element | null {
  const size = el.getBoundingClientRect()
  let parent = up(el)
  while (parent && skippable(parent.getBoundingClientRect(), size)) parent = up(parent)
  return parent
}

// 안쪽 문서의 맨 바깥에 닿으면 그 문서를 담은 iframe으로 이어짐, 맨 위 문서의 html은 고르지 않음
function up(el: Element): Element | null {
  const parent = el.parentElement
  if (parent && parent !== parent.ownerDocument.documentElement) return parent
  return el.ownerDocument === document ? null : (el.ownerDocument.defaultView?.frameElement ?? null)
}

const isFrame = (el: Element) => el.localName === 'iframe' || el.localName === 'frame'

// 다른 주소의 iframe이면 없음
function frameDocument(el: Element): Document | null {
  if (!isFrame(el)) return null
  try {
    return (el as HTMLIFrameElement).contentDocument
  } catch {
    return null
  }
}

function framePlace(el: Element) {
  const frames: FrameBox[] = []
  for (let doc = el.ownerDocument; doc !== document; ) {
    const frame = doc.defaultView!.frameElement!
    frames.push(frameBox(frame))
    doc = frame.ownerDocument
  }
  return placeInFrames(frames, { width: innerWidth, height: innerHeight })
}

/**
 * iframe 내용 영역의 화면 위치, 테두리와 안쪽 여백을 빼고 transform으로 줄거나 늘린 배율 반영
 */
function frameBox(frame: Element): FrameBox {
  const box = frame.getBoundingClientRect()
  const scale = (frame as HTMLElement).offsetWidth ? box.width / (frame as HTMLElement).offsetWidth : 1
  const style = getComputedStyle(frame)
  const [top, right, bottom, left] = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat)
  return {
    x: box.left + (frame.clientLeft + left) * scale,
    y: box.top + (frame.clientTop + top) * scale,
    width: frame.clientWidth - left - right,
    height: frame.clientHeight - top - bottom,
    scale,
  }
}

/**
 * 요소가 맨 위 화면에 보이는 곳, iframe 안의 요소는 iframe 밖으로 나간 부분을 자름
 */
function screenRect(el: Element): Rect {
  const box = el.getBoundingClientRect()
  if (el.ownerDocument === document) return { x: box.left, y: box.top, width: box.width, height: box.height }
  const { x, y, scale, visible } = framePlace(el)
  const left = Math.max(box.left, visible.x)
  const top = Math.max(box.top, visible.y)
  const width = Math.max(0, Math.min(box.right, visible.x + visible.width) - left)
  const height = Math.max(0, Math.min(box.bottom, visible.y + visible.height) - top)
  return { x: x + left * scale, y: y + top * scale, width: width * scale, height: height * scale }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

const skippable = (rect: DOMRect, current: DOMRect) => rect.width < 1 || rect.height < 1 || barelyLarger(rect, current)

// 가로, 세로 모두 크기 차이가 8px 미만인 요소 (스크롤 상자처럼 안쪽보다 훨씬 작은 바깥 요소는 고를 수 있게 둠)
const barelyLarger = (a: DOMRect, b: DOMRect) => Math.abs(a.width - b.width) < 8 && Math.abs(a.height - b.height) < 8
