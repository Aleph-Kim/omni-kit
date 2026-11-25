import type { Rect } from '../../shot'
import type { Item } from './types'

type Point = { x: number; y: number }

/** 상자를 영역 안에 넣는 가장 작은 이동량, 영역보다 큰 상자는 시작 쪽(왼쪽, 위)에 맞춤 */
export function shiftInside(rect: Rect, bounds: Rect): { dx: number; dy: number } {
  const axis = (start: number, size: number, min: number, max: number) => (start < min || size > max - min ? min - start : start + size > max ? max - start - size : 0)
  return { dx: axis(rect.x, rect.width, bounds.x, bounds.x + bounds.width), dy: axis(rect.y, rect.height, bounds.y, bounds.y + bounds.height) }
}

/** 영역 밖으로 나간 길이의 합 */
export function overflow(rect: Rect, bounds: Rect): number {
  const out = (start: number, end: number, min: number, max: number) => Math.max(0, min - start) + Math.max(0, end - max)
  return out(rect.x, rect.x + rect.width, bounds.x, bounds.x + bounds.width) + out(rect.y, rect.y + rect.height, bounds.y, bounds.y + bounds.height)
}

export function union(rects: Rect[]): Rect {
  const x = Math.min(...rects.map((rect) => rect.x))
  const y = Math.min(...rects.map((rect) => rect.y))
  const right = Math.max(...rects.map((rect) => rect.x + rect.width))
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height))
  return { x, y, width: right - x, height: bottom - y }
}

/** 그리는 중인 점을 영역 안쪽 margin까지로 제한 (영역이 좁으면 가운데) */
export function clampPoint(point: Point, bounds: Rect, margin: number): Point {
  const axis = (value: number, start: number, size: number) => {
    const inset = Math.min(margin, size / 2)
    return Math.min(start + size - inset, Math.max(start + inset, value))
  }
  return { x: axis(point.x, bounds.x, bounds.width), y: axis(point.y, bounds.y, bounds.height) }
}

/** 자료로 크기가 정해지는 요소의 요소 안 상자 (글자, 화살표, 펜은 konva로 재서 넘김) */
export function localBox(item: Exclude<Item, { kind: 'text' | 'arrow' | 'pen' }>): Rect {
  switch (item.kind) {
    case 'shape':
      // 선은 테두리 바깥으로 굵기의 절반만큼 나옴
      return { x: -item.thickness / 2, y: -item.thickness / 2, width: item.width + item.thickness, height: item.height + item.thickness }
    case 'mosaic':
    case 'blur':
      return { x: 0, y: 0, width: item.width, height: item.height }
    case 'icon':
    case 'number':
      return { x: 0, y: 0, width: item.size, height: item.size }
  }
}

/** 요소 안 상자를 늘린 비율, 회전, 자리 순으로 옮긴 뒤 감싼 상자 (konva Group의 변환 순서) */
export function itemBox(item: Item, local: Rect): Rect {
  const angle = (item.rotation * Math.PI) / 180
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  const corners = [
    [local.x, local.y],
    [local.x + local.width, local.y],
    [local.x, local.y + local.height],
    [local.x + local.width, local.y + local.height],
  ].map(([px, py]) => {
    const [sx, sy] = [px! * item.scaleX, py! * item.scaleY]
    return { x: item.x + sx * cos - sy * sin, y: item.y + sx * sin + sy * cos, width: 0, height: 0 }
  })
  return union(corners)
}

/** 요소들을 서로 간격을 유지한 채 영역 안으로 같이 옮김 (이미 안이면 그대로) */
export function fitItems(items: Item[], bounds: Rect, local: (item: Item) => Rect): Item[] {
  if (!items.length) return items
  const { dx, dy } = shiftInside(union(items.map((item) => itemBox(item, local(item)))), bounds)
  if (!dx && !dy) return items
  return items.map((item) => ({ ...item, x: item.x + dx, y: item.y + dy }))
}
