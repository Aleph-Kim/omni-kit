import { describe, expect, it } from 'vitest'
import { cardPlacement, clampInside, DEFAULT_DOCK, parseDock } from './dock'

const area = { width: 1000, height: 600 }
const bar = { width: 44, height: 400 }

describe('도구 줄 영역 안으로 맞추기', () => {
  it('안에 있으면 그대로', () => {
    expect(clampInside({ x: 100, y: 50 }, bar, area)).toEqual({ x: 100, y: 50 })
  })

  it('밖으로 나가면 가장자리까지', () => {
    expect(clampInside({ x: 990, y: 500 }, bar, area)).toEqual({ x: 956, y: 200 })
  })

  it('음수는 0', () => {
    expect(clampInside({ x: -20, y: -5 }, bar, area)).toEqual({ x: 0, y: 0 })
  })

  it('영역이 줄보다 작으면 0', () => {
    expect(clampInside({ x: 30, y: 30 }, bar, { width: 40, height: 300 })).toEqual({ x: 0, y: 0 })
  })
})

describe('속성 카드 자리', () => {
  it('세로 줄은 끝 쪽에 공간이 있으면 끝 쪽', () => {
    expect(cardPlacement({ x: 12, y: 12, ...bar }, area, true)).toEqual({ side: 'end', align: 'start', maxHeight: 588 })
  })

  it('세로 줄 끝 쪽에 공간이 없으면 시작 쪽', () => {
    expect(cardPlacement({ x: 900, y: 12, ...bar }, area, true).side).toBe('start')
  })

  it('세로 줄이 아래쪽에 있으면 아래 끝에 맞춤', () => {
    expect(cardPlacement({ x: 12, y: 190, ...bar }, area, true)).toEqual({ side: 'end', align: 'end', maxHeight: 590 })
  })

  it('가로 줄은 아래 공간이 160px 이상이면 위가 더 넓어도 아래', () => {
    expect(cardPlacement({ x: 12, y: 300, width: 500, height: 44 }, area, false)).toEqual({ side: 'below', align: 'start', maxHeight: 248 })
  })

  it('가로 줄 아래가 좁고 위가 넓으면 위', () => {
    expect(cardPlacement({ x: 12, y: 500, width: 500, height: 44 }, area, false)).toEqual({ side: 'above', align: 'start', maxHeight: 492 })
  })

  it('가로 줄 시작 쪽에 카드 폭이 안 되면 끝에 맞춤', () => {
    expect(cardPlacement({ x: 800, y: 12, width: 190, height: 44 }, area, false).align).toBe('end')
  })
})

describe('저장된 도구 줄 읽기', () => {
  it('없으면 처음 값', () => {
    expect(parseDock(undefined)).toEqual(DEFAULT_DOCK)
  })

  it('깨진 값이면 처음 값', () => {
    expect(parseDock({ x: 'a', y: 3, vertical: true, collapsed: false })).toEqual(DEFAULT_DOCK)
    expect(parseDock({ x: 1, y: 3 })).toEqual(DEFAULT_DOCK)
  })

  it('정상 값은 그대로', () => {
    const dock = { x: 40, y: 80, vertical: false, collapsed: true }
    expect(parseDock(dock)).toEqual(dock)
  })
})
