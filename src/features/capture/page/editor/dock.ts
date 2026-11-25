type Point = { x: number; y: number }
type Size = { width: number; height: number }
type Rect = Point & Size

/** 도구 줄 자리, x는 글 시작 쪽 가장자리에서 잰 거리 */
export type Dock = { x: number; y: number; vertical: boolean; collapsed: boolean }

export const DEFAULT_DOCK: Dock = { x: 12, y: 12, vertical: true, collapsed: false }

const KEY = 'captureToolbar'
const CARD_WIDTH = 256
const GAP = 8
// 가로 줄 아래에 이만큼 공간이 있으면 위가 더 넓어도 아래
const MIN_BELOW = 160

/**
 * 끌기와 그리기에서 도구 줄을 헤더 아래 영역 안으로 맞춤 (영역이 더 작으면 0)
 */
export function clampInside(pos: Point, size: Size, area: Size): Point {
  return {
    x: Math.max(0, Math.min(pos.x, area.width - size.width)),
    y: Math.max(0, Math.min(pos.y, area.height - size.height)),
  }
}

export type Placement = { side: 'end' | 'start' | 'below' | 'above'; align: 'start' | 'end'; maxHeight: number }

/**
 * 속성 카드와 말풍선을 도구 줄의 어느 쪽에 둘지 계산 (세로 줄은 끝 쪽, 가로 줄은 아래가 우선)
 */
export function cardPlacement(rect: Rect, area: Size, vertical: boolean): Placement {
  if (vertical) {
    const side = rect.x + rect.width + GAP + CARD_WIDTH <= area.width ? 'end' : 'start'
    const down = area.height - rect.y
    const up = rect.y + rect.height
    return down >= up ? { side, align: 'start', maxHeight: down } : { side, align: 'end', maxHeight: up }
  }
  const below = area.height - (rect.y + rect.height) - GAP
  const above = rect.y - GAP
  const align = rect.x + CARD_WIDTH <= area.width ? 'start' : 'end'
  return below >= MIN_BELOW || below >= above ? { side: 'below', align, maxHeight: below } : { side: 'above', align, maxHeight: above }
}

/**
 * 저장된 값 검사, 없거나 깨지면 처음 값
 */
export function parseDock(raw: unknown): Dock {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_DOCK
  const { x, y, vertical, collapsed } = raw as Record<string, unknown>
  if (!Number.isFinite(x) || !Number.isFinite(y) || typeof vertical !== 'boolean' || typeof collapsed !== 'boolean') return DEFAULT_DOCK
  return { x: x as number, y: y as number, vertical, collapsed }
}

export async function loadDock(): Promise<Dock> {
  const { [KEY]: raw } = await chrome.storage.local.get(KEY)
  return parseDock(raw)
}

export const saveDock = (dock: Dock) => chrome.storage.local.set({ [KEY]: dock })
