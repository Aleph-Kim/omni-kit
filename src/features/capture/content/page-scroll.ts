import { MAX_SHOTS, scrollPositions, type Rect } from '../shot'

export type PageInfo = { total: number; viewport: number; rect: Rect; viewportWidth: number }
export type FrameInfo = { origin: string; rect: Rect; viewportWidth: number }
export type Point = { x: number; y: number }
export type ElementInfo = { positions: Point[]; width: number; height: number; viewportWidth: number }
// 한 장에서 잘라 낼 화면 영역과 결과 그림 안의 위치
export type Slice = { rect: Rect; left: number; top: number }

type Axis = 'x' | 'y'

export type PageScroll = {
  findFrame(): FrameInfo | null
  prepare(maxSteps: number): Promise<PageInfo>
  prepareElement(): Promise<ElementInfo>
  scrollTo(y: number): Promise<number>
  scrollElement(point: Point): Promise<Slice[]>
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
  const handled = new Set<Element>()
  // 맨 위에 있을 때의 위치 지정, 스크롤하면 고정으로 바뀌는 요소를 되돌릴 때 사용
  const initial = new WeakMap<Element, { position: string; top: string; bottom: string }>()
  let target = root
  let unpinning = false
  let picked: Element | undefined
  // 고른 요소를 가로, 세로로 움직이는 스크롤 상자, 고른 요소 자체일 수도 있고 스크롤로 움직이지 않는 방향은 없음
  const pickedScrollers: Record<Axis, HTMLElement | null> = { x: null, y: null }
  // 고른 요소 안에서 세로로 스크롤되는 큰 목록(컬럼 안 카드 목록 등), 있으면 펼친 모양으로 이어 붙임
  let pickedInner: HTMLElement | null = null

  const setStyle = (el: HTMLElement, name: string, value: string) => {
    const previous = [el.style.getPropertyValue(name), el.style.getPropertyPriority(name)] as const
    el.style.setProperty(name, value, 'important')
    restores.push(() => el.style.setProperty(name, ...previous))
  }

  const isPinned = (position: string) => position === 'fixed' || position === 'sticky'

  const unpinNow = () => {
    for (const el of pageElements()) {
      // 고른 요소와 그 바깥 요소는 숨기지 않음
      if (handled.has(el) || el.contains(picked ?? null)) continue
      const { position } = getComputedStyle(el)
      if (!isPinned(position)) continue
      handled.add(el)
      // 고른 요소 안의 sticky(Figma 레이어 줄, 표 머리글 등)는 내용이라 숨기지 않고 원래 자리에 둠
      if (picked?.contains(el) && position === 'sticky') {
        setStyle(el, 'position', 'static')
        continue
      }
      // 스크롤하면 고정되는 머리글과 옆 칸(네이버 검색창, 오른쪽 칸 등)은 숨기면 빈칸이 생겨 맨 위에 있을 때의 자리로 되돌림
      const start = initial.get(el)
      if (start && !isPinned(start.position)) {
        setStyle(el, 'position', start.position)
        setStyle(el, 'top', start.top)
        setStyle(el, 'bottom', start.bottom)
      } else setStyle(el, 'opacity', '0')
    }
  }

  // 찍는 동안 사용자의 클릭과 스크롤을 막는 투명한 막을 깔고 스크롤 막대를 없앰
  const begin = async (scrollers: HTMLElement[]) => {
    const blocker = document.createElement('div')
    blocker.id = BLOCKER_ID
    blocker.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647'
    document.documentElement.append(blocker)

    for (const scroller of scrollers) {
      setStyle(scroller, 'scrollbar-width', 'none')
      setStyle(scroller, 'scroll-behavior', 'auto')
      // 스타일보다 먼저 되돌려 부드러운 스크롤 설정이 돌아오기 전에 제자리로
      const { scrollLeft, scrollTop } = scroller
      restores.push(() => scroller.scrollTo(scrollLeft, scrollTop))
    }

    // 스크롤 막대를 없애 폭이 바뀐 배치를 페이지가 다시 그린 뒤 잼
    await nextFrame()
    await nextFrame()
  }

  const recordInitial = () => {
    for (const el of pageElements()) {
      const { position, top, bottom } = getComputedStyle(el)
      initial.set(el, { position, top, bottom })
    }
  }

  const settle = async () => {
    await nextFrame()
    await nextFrame()
    await wait(100)
    // 스크롤해야 고정되는 요소가 있어 찍을 때마다 다시 찾음
    if (unpinning) {
      unpinNow()
      await nextFrame()
    }
  }

  const scrollTo = async (y: number) => {
    target.scrollTop = y
    await settle()
    return target.scrollTop
  }

  // 고른 요소 내용 전체가 지금 화면 어디에 있는지, 스크롤 상자면 안쪽 내용 전체
  const pickedContent = (): Rect => {
    const box = picked!.getBoundingClientRect()
    const rect = { x: box.left, y: box.top, width: box.width, height: box.height }
    const inner = picked === root ? { x: -root.scrollLeft, y: -root.scrollTop } : { x: box.left + picked!.clientLeft - picked!.scrollLeft, y: box.top + picked!.clientTop - picked!.scrollTop }
    if (pickedScrollers.x === picked) Object.assign(rect, { x: inner.x, width: picked!.scrollWidth })
    if (pickedScrollers.y === picked) Object.assign(rect, { y: inner.y, height: picked!.scrollHeight })
    return rect
  }

  // 화면과 스크롤 상자 안쪽이 겹쳐 실제로 보이는 곳, 가로와 세로를 따로 봐서 폭이나 높이가 0 이하일 수 있음
  const pickedClip = (): Rect => {
    let clip: Rect = { x: 0, y: 0, width: innerWidth, height: innerHeight }
    for (const scroller of [pickedScrollers.x, pickedScrollers.y]) if (scroller) clip = overlap(clip, viewRect(scroller, root))
    return clip
  }

  // 목록 위(머리글)는 맨 위에 있을 때, 목록 아래는 끝까지 내렸을 때만 찍고 목록 부분은 내린 만큼 아래에 붙임
  const innerSlices = (inner: HTMLElement): Slice[] => {
    const box = picked!.getBoundingClientRect()
    const across = overlap({ x: box.left, y: box.top, width: box.width, height: box.height }, pickedClip())
    const left = pickedScrollers.x ? across.x - box.left : 0
    const list = viewRect(inner, root)
    const band = (from: number, to: number, top: number): Slice[] =>
      to > from && across.width > 0 ? [{ rect: { x: across.x, y: from, width: across.width, height: to - from }, left, top }] : []
    const { scrollTop } = inner
    const listBottom = list.y + list.height
    return [
      ...(scrollTop <= 0 ? band(box.top, list.y, 0) : []),
      ...band(list.y, listBottom, list.y - box.top + scrollTop),
      ...(scrollTop >= inner.scrollHeight - inner.clientHeight - 1 ? band(listBottom, box.bottom, listBottom - box.top + scrollTop) : []),
    ]
  }

  return {
    /**
     * 문서도 안쪽 상자도 스크롤되지 않고 내용이 다른 주소의 큰 iframe 안에 있는 페이지(claude.ai 아티팩트 등)의 그 iframe
     */
    findFrame() {
      if (root.scrollHeight > root.clientHeight || findScrollTarget(root) !== root) return null
      let best: FrameInfo | null = null
      let bestArea = innerWidth * innerHeight * 0.5
      for (const frame of document.querySelectorAll('iframe')) {
        const origin = URL.parse(frame.src, location.href)?.origin
        if (!origin || origin === location.origin || !/^https?:/.test(origin)) continue
        const rect = clientRect(frame, root)
        if (rect.width * rect.height < bestArea) continue
        best = { origin, rect, viewportWidth: innerWidth }
        bestArea = rect.width * rect.height
      }
      return best
    },

    async prepare(maxSteps) {
      target = findScrollTarget(root)
      await begin([target])

      // 무한 스크롤 페이지(유튜브 등)는 내려가면 항목이 계속 붙어서 찍기를 누른 때 불러온 항목까지만 찍음
      const startHeight = target.scrollHeight
      const tail = tailElements(target, startHeight)

      // 스크롤해야 불러오는 그림을 미리 불러오도록 끝까지 한 번 내렸다가 올라옴
      for (let i = 0; i < maxSteps && target.scrollTop + target.clientHeight < Math.min(target.scrollHeight, startHeight); i++) {
        target.scrollTop += target.clientHeight
        await wait(100)
      }
      target.scrollTop = 0
      await wait(300)

      // 끝에 있던 "불러오는 중" 자리(유튜브 회색 카드 등)가 사라졌거나 그 앞에 새 항목이 끼어들었으면 원래 바로 앞 요소(처음 불러온 마지막 항목)의 끝에서 자름
      // 내려가는 동안 위쪽 항목도 길어져서(유튜브는 제목과 정보를 뒤늦게 채움) 처음에 잰 위치가 아니라 지금 위치로 잼
      // 페이지가 길어졌을 때만, 일반 페이지 끝에서 바뀌기만 하는 광고 등으로 잘리지 않게
      const shown = (el: Element | null): el is Element => !!el?.isConnected && el.getClientRects().length > 0
      const ends =
        target.scrollHeight > startHeight
          ? tail
              .filter(({ el, parent, prev }) => (!shown(el) || el.previousElementSibling !== prev) && shown(parent) && shown(prev))
              .map(({ prev }) => contentBottom(target, prev!))
          : []
      const total = Math.min(target.scrollHeight, ...(ends.length ? ends : [startHeight]))
      recordInitial()

      const rect = clientRect(target, root)
      return { total, viewport: rect.height, rect, viewportWidth: innerWidth }
    },

    /**
     * 요소 고르기로 고른 요소를 찍을 스크롤 위치, 화면보다 길거나 넓으면 요소 맨 앞부터 한 화면씩
     */
    async prepareElement() {
      picked = window.omniKitPickedElement
      if (!picked?.isConnected) throw new Error('picked element is gone')
      pickedScrollers.x = scrollerFor(picked, 'x', root)
      pickedScrollers.y = scrollerFor(picked, 'y', root)
      pickedInner = pickedScrollers.y === picked ? null : innerScroller(picked, root)
      target = pickedScrollers.y ?? root
      await begin([...new Set([pickedScrollers.x, pickedScrollers.y, pickedInner])].filter((el) => el !== null))
      recordInitial()
      // 요소를 화면 맨 위로 올리면 고정 머리글이 덮어서 첫 장부터 숨김
      unpinning = true
      unpinNow()
      await nextFrame()

      const content = pickedContent()
      const clip = pickedClip()
      const axis = (axis: Axis) => {
        const [start, size, clipStart, clipSize, scroll] =
          axis === 'x'
            ? [content.x, content.width, clip.x, clip.width, pickedScrollers.x?.scrollLeft]
            : [content.y, content.height, clip.y, clip.height, pickedScrollers.y?.scrollTop]
        // 스크롤로 움직이지 않는 방향은 보이는 부분만
        if (scroll === undefined) return { positions: [0], size: Math.min(start + size, clipStart + clipSize) - Math.max(start, clipStart) }
        if (start >= clipStart && start + size <= clipStart + clipSize) return { positions: [scroll], size }
        const first = scroll + start - clipStart
        return { positions: scrollPositions(size, clipSize).map((offset) => first + offset), size }
      }
      const x = axis('x')
      let y = axis('y')
      // 고른 요소가 세로로 다 보일 때만 안쪽 목록을 펼침, 목록이 늘어난 만큼 길어짐
      if (pickedInner && content.y >= clip.y && content.y + content.height <= clip.y + clip.height) {
        y = { positions: scrollPositions(pickedInner.scrollHeight, pickedInner.clientHeight), size: content.height + pickedInner.scrollHeight - pickedInner.clientHeight }
      } else pickedInner = null
      if (x.size <= 0 || y.size <= 0) throw new Error('picked element is not visible')
      const positions = y.positions.flatMap((y) => x.positions.map((x) => ({ x, y }))).slice(0, MAX_SHOTS)
      return { positions, width: x.size, height: y.size, viewportWidth: innerWidth }
    },

    scrollTo,

    async scrollElement({ x, y }) {
      if (pickedScrollers.x) pickedScrollers.x.scrollLeft = x
      if (pickedInner) pickedInner.scrollTop = y
      else if (pickedScrollers.y) pickedScrollers.y.scrollTop = y
      await settle()
      if (pickedInner) return innerSlices(pickedInner)
      const content = pickedContent()
      const rect = intersect(content, pickedClip())
      if (!rect) throw new Error('picked element is not visible')
      return [{ rect, left: pickedScrollers.x ? rect.x - content.x : 0, top: pickedScrollers.y ? rect.y - content.y : 0 }]
    },

    // 첫 장을 찍은 뒤 호출, 고정 머리글과 떠 있는 버튼이 장마다 반복해서 찍히지 않게 숨기거나 제자리로 되돌림
    hideFixed() {
      unpinning = true
      unpinNow()
    },

    restore() {
      unpinning = false
      picked = undefined
      window.omniKitPickedElement = undefined
      pickedScrollers.x = pickedScrollers.y = null
      pickedInner = null
      handled.clear()
      while (restores.length) restores.pop()!()
      document.getElementById(BLOCKER_ID)?.remove()
    },
  }
}

/**
 * body 안 모든 요소, 웹 컴포넌트의 shadow DOM 안에 고정된 버튼(Scramble 문서의 warnings 버튼 등)까지 포함
 */
function pageElements(): HTMLElement[] {
  const elements: HTMLElement[] = []
  const walk = (parent: ParentNode) => {
    for (const el of parent.querySelectorAll<HTMLElement>('*')) {
      elements.push(el)
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document.body)
  return elements
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

/**
 * 요소를 그 방향으로 움직이는 가장 가까운 스크롤 상자(요소 자체 포함), 고정된 바깥 요소가 먼저 나오면 스크롤해도 움직이지 않아 없음
 */
function scrollerFor(el: Element, axis: Axis, root: HTMLElement): HTMLElement | null {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node instanceof HTMLElement && scrolls(node, axis, root)) return node
    if (node === root || getComputedStyle(node).position === 'fixed') return null
  }
  return null
}

function scrolls(el: HTMLElement, axis: Axis, root: HTMLElement): boolean {
  const overflows = axis === 'x' ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight
  if (!overflows) return false
  if (el === root) return true
  const overflow = getComputedStyle(el)[axis === 'x' ? 'overflowX' : 'overflowY']
  return overflow === 'auto' || overflow === 'scroll'
}

/**
 * 요소 안에서 세로로 스크롤되는 상자 중 요소 넓이의 절반 이상인 가장 큰 것, 여러 컬럼이 따로 스크롤되는 보드 전체처럼 하나로 펼칠 수 없으면 없음
 */
function innerScroller(el: Element, root: HTMLElement): HTMLElement | null {
  const box = el.getBoundingClientRect()
  let best: HTMLElement | null = null
  let bestArea = (box.width * box.height) / 2
  for (const node of el.querySelectorAll<HTMLElement>('*')) {
    if (!scrolls(node, 'y', root)) continue
    const area = node.clientWidth * node.clientHeight
    if (area >= bestArea) {
      best = node
      bestArea = area
    }
  }
  return best
}

/** 스크롤 상자 안쪽이 화면에 보이는 곳 */
function viewRect(el: HTMLElement, root: HTMLElement): Rect {
  if (el === root) return { x: 0, y: 0, width: el.clientWidth, height: el.clientHeight }
  const box = el.getBoundingClientRect()
  return { x: box.left + el.clientLeft, y: box.top + el.clientTop, width: el.clientWidth, height: el.clientHeight }
}

function overlap(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  return { x, y, width: Math.min(a.x + a.width, b.x + b.width) - x, height: Math.min(a.y + a.height, b.y + b.height) - y }
}

function intersect(a: Rect, b: Rect): Rect | null {
  const rect = overlap(a, b)
  return rect.width > 0 && rect.height > 0 ? rect : null
}

/** 스크롤 내용 맨 위에서 요소 끝까지의 거리 */
function contentBottom(target: HTMLElement, el: Element): number {
  const origin = target === document.scrollingElement ? 0 : target.getBoundingClientRect().top + target.clientTop
  return el.getBoundingClientRect().bottom - origin + target.scrollTop
}

/**
 * 페이지 끝 한 화면 안에서 끝나는 요소와 그 부모, 바로 앞 요소
 */
function tailElements(target: HTMLElement, height: number) {
  const tail = []
  for (const el of target.querySelectorAll('*')) {
    if (el.getClientRects().length > 0 && contentBottom(target, el) >= height - target.clientHeight) {
      tail.push({ el, parent: el.parentElement, prev: el.previousElementSibling })
    }
  }
  return tail
}

function clientRect(el: HTMLElement, root: HTMLElement): Rect {
  if (el === root) return { x: 0, y: 0, width: el.clientWidth, height: el.clientHeight }
  const box = el.getBoundingClientRect()
  const x = Math.max(0, box.left + el.clientLeft)
  const y = Math.max(0, box.top + el.clientTop)
  return { x, y, width: Math.min(el.clientWidth, innerWidth - x), height: Math.min(el.clientHeight, innerHeight - y) }
}
