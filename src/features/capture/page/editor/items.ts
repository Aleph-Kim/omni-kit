import { newId, type Doc, type Item, type Style, type Tool } from './types'

export const DEFAULT_STYLE: Style = { color: '#ff3b30', fill: null, thickness: 6, font: 'system', fontSize: 32, icon: 'check', size: 64, curve: false, shape: 'rect', strength: 4 }

/** 끌어서 그리는 도구의 시작 요소, 끄는 동안 resize로 크기를 늘림 */
export function startItem(tool: Tool, at: { x: number; y: number }, style: Style): Item | null {
  const base = { id: newId(), x: at.x, y: at.y, rotation: 0, scaleX: 1, scaleY: 1 }
  const { color, thickness } = style
  switch (tool) {
    case 'arrow':
      return { ...base, kind: tool, points: [0, 0, 0, 0], color, thickness, curve: style.curve }
    case 'pen':
      return { ...base, kind: tool, points: [0, 0, 0, 0], color, thickness }
    case 'shape':
      return { ...base, kind: tool, shape: style.shape, width: 0, height: 0, color, fill: style.fill, thickness }
    case 'mosaic':
    case 'blur':
      return { ...base, kind: tool, width: 0, height: 0, strength: style.strength }
    default:
      return null
  }
}

/** 누른 자리에 바로 놓는 요소 (아이콘은 가운데를 맞춤, 번호는 이 장에서 다음 숫자) */
export function placeItem(at: { x: number; y: number }, style: Style, doc: Doc): Item {
  const { size } = style
  const base = { id: newId(), x: at.x - size / 2, y: at.y - size / 2, rotation: 0, scaleX: 1, scaleY: 1 }
  if (style.icon !== NUMBER) return { ...base, kind: 'icon', icon: style.icon, size, color: style.color }
  const value = Math.max(0, ...doc.items.map((item) => (item.kind === 'number' ? item.value : 0))) + 1
  return { ...base, kind: 'number', value, size, color: style.color }
}

/** 아이콘 목록에서 번호 동그라미를 가리키는 값 */
export const NUMBER = 'number'

/** 끄는 중인 요소를 시작점에서 지금 위치까지로 늘림 (네모, 가리기는 거꾸로 끌어도 양수 크기) */
export function resize(item: Item, start: { x: number; y: number }, at: { x: number; y: number }): Item {
  const dx = at.x - start.x
  const dy = at.y - start.y
  switch (item.kind) {
    case 'arrow':
      return { ...item, points: item.curve ? [...item.points, dx, dy] : [0, 0, dx, dy] }
    case 'pen':
      return { ...item, points: [...item.points, dx, dy] }
    case 'shape':
    case 'mosaic':
    case 'blur':
      return { ...item, x: Math.min(start.x, at.x), y: Math.min(start.y, at.y), width: Math.abs(dx), height: Math.abs(dy) }
    default:
      return item
  }
}

/** 누르기만 하고 거의 끌지 않은 요소 (버림) */
export function isTiny(item: Item): boolean {
  if (item.kind === 'arrow' || item.kind === 'pen') {
    const xs = item.points.filter((_, index) => index % 2 === 0)
    const ys = item.points.filter((_, index) => index % 2 === 1)
    return Math.max(...xs) - Math.min(...xs) < 3 && Math.max(...ys) - Math.min(...ys) < 3
  }
  if ('width' in item) return item.width < 3 || item.height < 3
  return false
}

/** 속성 카드에서 바꾼 값을 고른 요소에 적용, 그 요소에 없는 값은 무시 */
export function applyStyle(item: Item, patch: Partial<Style>): Item {
  const next = { ...item } as Record<string, unknown>
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'icon') {
      if (item.kind === 'icon' && value !== NUMBER) next.icon = value
    } else if (key === 'curve' && item.kind === 'arrow' && !value) {
      // 곡선을 직선으로 바꾸면 시작점과 끝점만 남김
      next.curve = false
      next.points = [0, 0, ...item.points.slice(-2)]
    } else if (key === 'size' && 'size' in item) {
      // 아이콘 크기를 바꿔도 가운데 자리는 그대로 (회전과 늘린 비율 반영)
      const half = (item.size - (value as number)) / 2
      const angle = (item.rotation * Math.PI) / 180
      const [dx, dy] = [half * item.scaleX, half * item.scaleY]
      next.size = value
      next.x = item.x + dx * Math.cos(angle) - dy * Math.sin(angle)
      next.y = item.y + dx * Math.sin(angle) + dy * Math.cos(angle)
    } else if (key in item) next[key] = value
  }
  return next as Item
}

/** 고른 요소의 값을 속성 카드에 보여 주려고 지금 값에 덮어씀 */
export function styleOf(item: Item, style: Style): Style {
  const next = { ...style }
  for (const key of Object.keys(style) as (keyof Style)[]) if (key in item) (next as Record<string, unknown>)[key] = (item as Record<string, unknown>)[key]
  return next
}

/** 붙여넣기할 때마다 앞서 붙인 자리에서 비껴 놓음 */
export const PASTE_OFFSET = 20

export const pasted = (item: Item): Item => ({ ...item, id: newId(), x: item.x + PASTE_OFFSET, y: item.y + PASTE_OFFSET })

/**
 * 곡선 화살표를 그린 뒤 다듬은 점 목록, 화면에서 곡선 길이의 5%(4px에서 16px) 안쪽 굴곡을 지움
 * 길이에 비례해야 긴 곡선은 깔끔하고 짧고 완만한 곡선은 직선으로 펴지지 않음
 */
export function smoothCurve(points: number[], zoom: number): number[] {
  let length = 0
  for (let index = 2; index < points.length; index += 2) length += Math.hypot(points[index]! - points[index - 2]!, points[index + 1]! - points[index - 1]!)
  const tolerance = Math.min(16, Math.max(4, length * zoom * 0.05))
  return simplifyPath(points, tolerance / zoom)
}

/**
 * 끈 길에서 손떨림으로 생긴 작은 굴곡을 지운 점 목록, 거의 곧게 끌면 시작점과 끝점만 남음
 * 점 목록은 x, y를 번갈아 담은 배열, tolerance는 버려도 되는 최대 거리
 */
export function simplifyPath(points: number[], tolerance: number): number[] {
  const count = points.length / 2
  if (count <= 2) return points
  const keep = new Array<boolean>(count).fill(false)
  keep[0] = keep[count - 1] = true
  const stack: [number, number][] = [[0, count - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()!
    let farthest = -1
    let distance = tolerance
    for (let index = first + 1; index < last; index++) {
      const d = lineDistance(points, index, first, last)
      if (d > distance) [farthest, distance] = [index, d]
    }
    if (farthest < 0) continue
    keep[farthest] = true
    stack.push([first, farthest], [farthest, last])
  }
  return keep.flatMap((kept, index) => (kept ? [points[index * 2]!, points[index * 2 + 1]!] : []))
}

function lineDistance(points: number[], index: number, first: number, last: number) {
  const [x, y, x1, y1, x2, y2] = [index, first, last].flatMap((at) => [points[at * 2]!, points[at * 2 + 1]!]) as [number, number, number, number, number, number]
  const length = Math.hypot(x2 - x1, y2 - y1)
  if (length === 0) return Math.hypot(x - x1, y - y1)
  return Math.abs((x2 - x1) * (y1 - y) - (x1 - x) * (y2 - y1)) / length
}

export type Order = 'front' | 'forward' | 'backward' | 'back'

/** 고른 요소들의 앞뒤 순서 바꾸기 (뒤에 있는 요소가 위에 그려짐), 여러 개를 고르면 서로의 순서는 유지 */
export function reorder(items: Item[], ids: string[], order: Order): Item[] {
  const picked = (item: Item) => ids.includes(item.id)
  if (order === 'front') return [...items.filter((item) => !picked(item)), ...items.filter(picked)]
  if (order === 'back') return [...items.filter(picked), ...items.filter((item) => !picked(item))]
  const next = [...items]
  // 한 칸씩 옮길 때는 바로 앞(뒤) 요소가 고르지 않은 것일 때만 자리를 바꿈
  const swap = (a: number, b: number) => ([next[a], next[b]] = [next[b]!, next[a]!])
  if (order === 'forward') {
    for (let index = next.length - 2; index >= 0; index--) if (picked(next[index]!) && !picked(next[index + 1]!)) swap(index, index + 1)
  } else {
    for (let index = 1; index < next.length; index++) if (picked(next[index]!) && !picked(next[index - 1]!)) swap(index, index - 1)
  }
  return next
}
