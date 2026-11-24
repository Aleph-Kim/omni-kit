import type { Rect } from '../shot'

export type PageInfo = { total: number; viewport: number; rect: Rect; viewportWidth: number }

export type PageScroll = {
  prepare(maxSteps: number): Promise<PageInfo>
  scrollTo(y: number): Promise<number>
  hideFixed(): void
  restore(): void
}

declare global {
  interface Window {
    omniKitPageScroll?: PageScroll
  }
}

const BLOCKER_ID = 'omni-kit-page-scroll'

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms))
const nextFrame = () => new Promise(requestAnimationFrame)

// 서비스 워커가 executeScript로 한 단계씩 호출
window.omniKitPageScroll = createPageScroll()

function createPageScroll(): PageScroll {
  const root = (document.scrollingElement ?? document.documentElement) as HTMLElement
  const restores: (() => void)[] = []
  let target = root
  let startTop = 0

  const setStyle = (el: HTMLElement, name: string, value: string) => {
    const previous = [el.style.getPropertyValue(name), el.style.getPropertyPriority(name)] as const
    el.style.setProperty(name, value, 'important')
    restores.push(() => el.style.setProperty(name, ...previous))
  }

  return {
    async prepare(maxSteps) {
      // 찍는 동안 사용자의 클릭과 스크롤을 막는 투명한 막
      const blocker = document.createElement('div')
      blocker.id = BLOCKER_ID
      blocker.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647'
      document.documentElement.append(blocker)

      target = findScrollTarget(root)
      setStyle(target, 'scrollbar-width', 'none')
      setStyle(target, 'scroll-behavior', 'auto')
      startTop = target.scrollTop

      // 스크롤해야 불러오는 그림을 미리 불러오도록 끝까지 한 번 내렸다가 올라옴
      for (let i = 0; i < maxSteps && target.scrollTop + target.clientHeight < target.scrollHeight; i++) {
        target.scrollTop += target.clientHeight
        await wait(100)
      }
      target.scrollTop = 0
      await wait(300)

      const rect = clientRect(target, root)
      return { total: target.scrollHeight, viewport: rect.height, rect, viewportWidth: innerWidth }
    },

    async scrollTo(y) {
      target.scrollTop = y
      await nextFrame()
      await nextFrame()
      await wait(100)
      return target.scrollTop
    },

    // 첫 장을 찍은 뒤 호출, 고정 머리글과 떠 있는 버튼이 장마다 반복해서 찍히지 않게 숨김
    hideFixed() {
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        const { position } = getComputedStyle(el)
        if (position === 'fixed' || position === 'sticky') setStyle(el, 'opacity', '0')
      }
    },

    restore() {
      target.scrollTop = startTop
      while (restores.length) restores.pop()!()
      document.getElementById(BLOCKER_ID)?.remove()
    },
  }
}

/**
 * 문서가 스크롤되지 않고 안쪽 상자만 스크롤되는 페이지는 화면에서 가장 넓은 스크롤 상자를 찍음
 */
function findScrollTarget(root: HTMLElement): HTMLElement {
  if (root.scrollHeight > root.clientHeight) return root
  let best = root
  let bestArea = 0
  for (const el of document.querySelectorAll<HTMLElement>('body *')) {
    if (el.scrollHeight <= el.clientHeight) continue
    const { overflowY } = getComputedStyle(el)
    if (overflowY !== 'auto' && overflowY !== 'scroll') continue
    const area = el.clientWidth * el.clientHeight
    if (area > bestArea) {
      best = el
      bestArea = area
    }
  }
  return best
}

function clientRect(el: HTMLElement, root: HTMLElement): Rect {
  if (el === root) return { x: 0, y: 0, width: el.clientWidth, height: el.clientHeight }
  const box = el.getBoundingClientRect()
  const x = Math.max(0, box.left + el.clientLeft)
  const y = Math.max(0, box.top + el.clientTop)
  return { x, y, width: Math.min(el.clientWidth, innerWidth - x), height: Math.min(el.clientHeight, innerHeight - y) }
}
