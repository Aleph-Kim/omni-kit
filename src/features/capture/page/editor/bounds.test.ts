import { describe, expect, it } from 'vitest'
import { clampPoint, fitItems, itemBox, localBox, overflow, shiftInside, union } from './bounds'
import type { Item } from './types'

const bounds = { x: 0, y: 0, width: 100, height: 80 }
const shape = (x: number, y: number, extra: Partial<Item> = {}): Item =>
  ({ id: `s${x}${y}`, kind: 'shape', shape: 'rect', x, y, width: 10, height: 10, rotation: 0, scaleX: 1, scaleY: 1, color: '#000', fill: null, thickness: 0, ...extra }) as Item
const box = (item: Item) => localBox(item as Extract<Item, { kind: 'shape' }>)

describe('영역 안으로 맞추기', () => {
  it('안에 있으면 이동 없음', () => {
    expect(shiftInside({ x: 10, y: 10, width: 20, height: 20 }, bounds)).toEqual({ dx: 0, dy: 0 })
  })

  it('밖으로 나가면 가장자리까지', () => {
    expect(shiftInside({ x: 90, y: -5, width: 20, height: 20 }, bounds)).toEqual({ dx: -10, dy: 5 })
    expect(shiftInside({ x: -3, y: 70, width: 20, height: 20 }, bounds)).toEqual({ dx: 3, dy: -10 })
  })

  it('영역보다 큰 상자는 시작 쪽에 맞춤', () => {
    expect(shiftInside({ x: 20, y: -10, width: 150, height: 100 }, bounds)).toEqual({ dx: -20, dy: 10 })
  })

  it('밖으로 나간 길이의 합', () => {
    expect(overflow({ x: 10, y: 10, width: 20, height: 20 }, bounds)).toBe(0)
    expect(overflow({ x: -5, y: 70, width: 20, height: 20 }, bounds)).toBe(15)
    expect(overflow({ x: -10, y: 0, width: 120, height: 10 }, bounds)).toBe(20)
  })

  it('여러 상자를 감싼 상자', () => {
    expect(union([{ x: 0, y: 5, width: 10, height: 10 }, { x: 20, y: -5, width: 5, height: 5 }])).toEqual({ x: 0, y: -5, width: 25, height: 20 })
  })

  it('점은 영역 안쪽 margin까지, 좁은 영역은 가운데', () => {
    expect(clampPoint({ x: -20, y: 200 }, bounds, 5)).toEqual({ x: 5, y: 75 })
    expect(clampPoint({ x: 50, y: 40 }, bounds, 5)).toEqual({ x: 50, y: 40 })
    expect(clampPoint({ x: 0, y: 0 }, { x: 10, y: 10, width: 4, height: 4 }, 5)).toEqual({ x: 12, y: 12 })
  })
})

describe('요소를 감싼 상자', () => {
  it('도형은 선 굵기의 절반만큼 바깥까지', () => {
    const item = shape(10, 20, { thickness: 4 })
    expect(itemBox(item, box(item))).toEqual({ x: 8, y: 18, width: 14, height: 14 })
  })

  it('늘린 비율 반영', () => {
    const item = shape(10, 20, { scaleX: 2, scaleY: 3 })
    expect(itemBox(item, box(item))).toEqual({ x: 10, y: 20, width: 20, height: 30 })
  })

  it('45도 돌린 네모는 돌린 모양을 감싼 상자', () => {
    const item = shape(0, 0, { rotation: 45 })
    const rect = itemBox(item, box(item))
    const half = 10 * Math.SQRT1_2
    expect(rect.x).toBeCloseTo(-half)
    expect(rect.y).toBeCloseTo(0)
    expect(rect.width).toBeCloseTo(2 * half)
    expect(rect.height).toBeCloseTo(2 * half)
  })

  it('돌려서 밖으로 나간 만큼 안으로 옮김', () => {
    const [moved] = fitItems([shape(0, 0, { rotation: 45 })], bounds, box)
    expect(moved!.x).toBeCloseTo(10 * Math.SQRT1_2)
    expect(moved!.y).toBe(0)
  })
})

describe('묶음 맞추기', () => {
  it('간격을 유지하며 같이 옮김', () => {
    const items = [shape(80, 10), shape(95, 60)]
    const moved = fitItems(items, bounds, box)
    expect(moved.map((item) => [item.x, item.y])).toEqual([
      [75, 10],
      [90, 60],
    ])
  })

  it('이미 안이면 그대로', () => {
    const items = [shape(10, 10), shape(30, 30)]
    expect(fitItems(items, bounds, box)).toBe(items)
  })
})
