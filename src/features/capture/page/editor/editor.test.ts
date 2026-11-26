import { describe, expect, it } from 'vitest'
import { commit, initHistory, redo, undo } from './history'
import { addCustomColor } from './colors'
import { applyStyle, placeItem, reorder, simplifyPath, smoothCurve, startItem, resize, DEFAULT_STYLE, NUMBER } from './items'
import { editorAction, isHoldKey, toolKeyAction } from './keys'
import type { Item } from './types'
import { dragRect, exportArea, fitZoom, maxZoom, stepZoom } from './view'

describe('history', () => {
  it('되돌리고 다시 하기', () => {
    let history = commit(commit(initHistory('a'), 'b'), 'c')
    history = undo(undo(history))
    expect(history.present).toBe('a')
    history = redo(history)
    expect(history.present).toBe('b')
  })

  it('되돌린 뒤 새로 바꾸면 다시 하기 목록을 비움', () => {
    const history = commit(undo(commit(initHistory('a'), 'b')), 'c')
    expect(history.future).toEqual([])
    expect(redo(history).present).toBe('c')
  })

  it('처음과 끝에서는 그대로', () => {
    const history = initHistory('a')
    expect(undo(history)).toBe(history)
    expect(redo(history)).toBe(history)
  })

  it('기록은 최대 100번', () => {
    let history = initHistory(0)
    for (let i = 1; i <= 150; i++) history = commit(history, i)
    expect(history.past.length).toBe(100)
    expect(history.past[0]).toBe(50)
  })
})

describe('editorAction', () => {
  const key = (key: string, code: string, extra: Partial<KeyboardEvent> = {}) => ({ key, code, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...extra })

  it('맥은 Cmd, 그 외는 Ctrl', () => {
    expect(editorAction(key('z', 'KeyZ', { metaKey: true }), true, false)).toBe('undo')
    expect(editorAction(key('z', 'KeyZ', { ctrlKey: true }), true, false)).toBeNull()
    expect(editorAction(key('z', 'KeyZ', { ctrlKey: true }), false, false)).toBe('undo')
    expect(editorAction(key('Z', 'KeyZ', { metaKey: true, shiftKey: true }), true, false)).toBe('redo')
    expect(editorAction(key('y', 'KeyY', { ctrlKey: true }), false, false)).toBe('redo')
    expect(editorAction(key('y', 'KeyY', { metaKey: true }), true, false)).toBeNull()
  })

  it('복사, 붙여넣기', () => {
    expect(editorAction(key('c', 'KeyC', { metaKey: true }), true, false)).toBe('copy')
    expect(editorAction(key('v', 'KeyV', { ctrlKey: true }), false, false)).toBe('paste')
    expect(editorAction(key('V', 'KeyV', { ctrlKey: true, shiftKey: true }), false, false)).toBeNull()
  })

  it('한글 자판은 자판 위치로 판별', () => {
    expect(editorAction(key('ㅋ', 'KeyZ', { metaKey: true }), true, false)).toBe('undo')
    expect(editorAction(key('ㅊ', 'KeyC', { metaKey: true }), true, false)).toBe('copy')
    expect(editorAction(key('ㅍ', 'KeyV', { metaKey: true }), true, false)).toBe('paste')
  })

  it('프랑스어 자판은 글자로 판별 (Z가 W 위치)', () => {
    expect(editorAction(key('z', 'KeyW', { ctrlKey: true }), false, false)).toBe('undo')
    expect(editorAction(key('w', 'KeyZ', { ctrlKey: true }), false, false)).toBeNull()
  })

  it('지우기와 Esc', () => {
    expect(editorAction(key('Backspace', 'Backspace'), true, false)).toBe('delete')
    expect(editorAction(key('Delete', 'Delete'), false, false)).toBe('delete')
    expect(editorAction(key('Escape', 'Escape'), false, false)).toBe('escape')
  })

  it('글자 입력 중에는 가로채지 않음', () => {
    expect(editorAction(key('Backspace', 'Backspace'), true, true)).toBeNull()
    expect(editorAction(key('z', 'KeyZ', { metaKey: true }), true, true)).toBeNull()
  })
})

describe('view', () => {
  it('맞춤 배율은 그림 전체가 보이고 작은 그림은 키우지 않음', () => {
    expect(fitZoom({ width: 2000, height: 1000 }, { width: 1000, height: 1000 }, 1)).toBe(0.5)
    expect(fitZoom({ width: 1000, height: 4000 }, { width: 1000, height: 1000 }, 1)).toBe(0.25)
    expect(fitZoom({ width: 100, height: 100 }, { width: 1000, height: 1000 }, 1)).toBe(1)
  })

  it('맞춤 배율은 원래 크기보다 키우지 않음', () => {
    expect(fitZoom({ width: 100, height: 100 }, { width: 1000, height: 1000 }, 2)).toBe(0.5)
    expect(fitZoom({ width: 2000, height: 1000 }, { width: 1000, height: 1000 }, 2)).toBe(0.5)
    expect(fitZoom({ width: 4000, height: 1000 }, { width: 1000, height: 1000 }, 2)).toBe(0.25)
  })

  it('확대, 축소는 10% 단위로 반올림한 뒤 10%씩', () => {
    expect(stepZoom(1, 1)).toBe(1.1)
    expect(stepZoom(1, -1)).toBe(0.9)
    expect(stepZoom(0.69, 1)).toBe(0.8)
    expect(stepZoom(0.69, -1)).toBe(0.6)
    expect(stepZoom(0.64, 1)).toBe(0.7)
    expect(stepZoom(0.64, -1)).toBe(0.5)
    expect(stepZoom(4, 1)).toBe(4)
    expect(stepZoom(0.1, -1)).toBe(0.1)
  })

  it('아주 긴 그림은 캔버스 한도 안으로 확대 제한', () => {
    const max = maxZoom({ width: 2560, height: 16384 }, 2)
    expect(max * 2 * 16384).toBeLessThanOrEqual(16000)
    expect(stepZoom(0.45, 1, max)).toBe(max)
    expect(maxZoom({ width: 800, height: 600 }, 2)).toBe(4)
  })

  it('거꾸로 끈 영역도 양수 크기, 그림 밖은 잘라냄', () => {
    expect(dragRect({ x: 50, y: 60 }, { x: 10, y: -20 }, { width: 100, height: 100 })).toEqual({ x: 10, y: 0, width: 40, height: 60 })
  })

  it('내보내기는 확대 배율과 상관없이 원본 픽셀 크기', () => {
    const size = { width: 1600, height: 1000 }
    for (const zoom of [0.25, 1, 2]) {
      const area = exportArea(size, null, { x: 0, y: 0 }, zoom)
      expect(area.width * area.pixelRatio).toBeCloseTo(1600)
      expect(area.height * area.pixelRatio).toBeCloseTo(1000)
    }
  })

  it('내보내기 캔버스 크기가 소수 오차 없이 원본 정수와 같음', () => {
    const sizes = [{ width: 2880, height: 7777 }, { width: 1600, height: 1000 }, { width: 3001, height: 16383 }]
    const zooms = [0.37, 0.3, 0.7, 1.3, 0.5, 1 / 1.25]
    for (let z = 0.01; z <= 2; z += 0.0137) zooms.push(z)
    for (const size of sizes) {
      for (const zoom of zooms) {
        const area = exportArea(size, null, { x: 0, y: 0 }, zoom)
        expect(Math.floor(area.width * area.pixelRatio)).toBe(size.width)
        expect(Math.floor(area.height * area.pixelRatio)).toBe(size.height)
      }
    }
  })

  it('배율은 화면 배율을 곱한 표시 값 기준으로 10% 단위', () => {
    expect(stepZoom(0.5, 1, 4, 2)).toBe(0.55)
    expect(stepZoom(0.5, -1, 4, 2)).toBe(0.45)
    expect(stepZoom(0.1, -1, 4, 2)).toBe(0.05)
    expect(stepZoom(2, 1, 4, 2)).toBe(2)
    expect(stepZoom(0.345, 1, 4, 2)).toBeCloseTo(0.4)
  })

  it('자른 영역만 내보냄, 보이는 영역 시작점 반영', () => {
    const crop = { x: 100.4, y: 50, width: 300, height: 200 }
    const half = exportArea({ width: 1600, height: 1000 }, crop, { x: 100, y: 50 }, 0.5)
    expect(half).toMatchObject({ x: 0, y: 0, pixelRatio: 2 })
    expect(half.width).toBeCloseTo(150)
    expect(half.height).toBeCloseTo(100)
    const full = exportArea({ width: 1600, height: 1000 }, crop, { x: 0, y: 0 }, 2)
    expect(full).toMatchObject({ x: 200, y: 100, pixelRatio: 0.5 })
    expect(full.width).toBeCloseTo(600)
    expect(full.height).toBeCloseTo(400)
  })
})

describe('arrow', () => {
  it('직선 화살표는 끈 길과 상관없이 시작점과 끝점만', () => {
    let item = startItem('arrow', { x: 10, y: 10 }, DEFAULT_STYLE)!
    for (const at of [{ x: 20, y: 13 }, { x: 30, y: 8 }, { x: 40, y: 10 }]) item = resize(item, { x: 10, y: 10 }, at)
    expect(item.kind === 'arrow' && item.points).toEqual([0, 0, 30, 0])
  })

  it('곡선 화살표는 끈 길을 따름', () => {
    let item = startItem('arrow', { x: 0, y: 0 }, { ...DEFAULT_STYLE, curve: true })!
    for (const at of [{ x: 10, y: 10 }, { x: 20, y: 0 }]) item = resize(item, { x: 0, y: 0 }, at)
    expect(item.kind === 'arrow' && item.points).toEqual([0, 0, 0, 0, 10, 10, 20, 0])
  })

  it('곡선을 직선으로 바꾸면 시작점과 끝점만 남김', () => {
    const item = { ...startItem('arrow', { x: 0, y: 0 }, { ...DEFAULT_STYLE, curve: true })!, points: [0, 0, 10, 10, 20, 0] }
    const straight = applyStyle(item, { curve: false })
    expect(straight.kind === 'arrow' && [straight.curve, straight.points]).toEqual([false, [0, 0, 20, 0]])
  })

  it('손떨림 정도의 굴곡은 지우고 큰 굽이는 남김', () => {
    const shaky = [0, 0, 10, 1, 20, -1, 30, 1, 40, 0]
    expect(simplifyPath(shaky, 3)).toEqual([0, 0, 40, 0])
    const bend = [0, 0, 10, 20, 20, 30, 30, 20, 40, 0]
    expect(simplifyPath(bend, 3)).toContain(30)
    expect(simplifyPath(bend, 3).slice(0, 2)).toEqual([0, 0])
    expect(simplifyPath(bend, 3).slice(-2)).toEqual([40, 0])
  })

  it('곡선 다듬기는 곡선 길이에 비례 (긴 곡선의 굴곡은 지우고 짧고 완만한 곡선은 남김)', () => {
    const wobble = Array.from({ length: 61 }, (_, i) => [i * 5, -Math.sin(i / 12) * 60 + (i % 2 ? 6 : -6)]).flat()
    const long = smoothCurve(wobble, 1)
    expect(long.length / 2).toBeLessThanOrEqual(6)
    expect(long.length / 2).toBeGreaterThan(2)
    const gentle = Array.from({ length: 11 }, (_, i) => [i * 8, -Math.sin((i / 10) * Math.PI) * 8]).flat()
    expect(smoothCurve(gentle, 1).length / 2).toBeGreaterThan(2)
  })
})

describe('icon', () => {
  it('아이콘과 번호는 속성의 크기로 누른 자리 가운데에 놓음', () => {
    const icon = placeItem({ x: 100, y: 100 }, { ...DEFAULT_STYLE, size: 120 }, { items: [], crop: null })
    expect(icon.kind === 'icon' && [icon.size, icon.x, icon.y]).toEqual([120, 40, 40])
    const number = placeItem({ x: 100, y: 100 }, { ...DEFAULT_STYLE, icon: NUMBER, size: 40 }, { items: [], crop: null })
    expect(number.kind === 'number' && [number.size, number.value]).toEqual([40, 1])
  })

  it('고른 아이콘의 크기를 바꿔도 가운데 자리는 그대로', () => {
    const icon = placeItem({ x: 100, y: 100 }, { ...DEFAULT_STYLE, size: 256 }, { items: [], crop: null })
    const smaller = applyStyle(icon, { size: 24 })
    expect(smaller.kind === 'icon' && [smaller.size, smaller.x + 12, smaller.y + 12]).toEqual([24, 100, 100])
  })

  it('회전한 아이콘도 크기를 바꾸면 가운데 자리 유지', () => {
    type Icon = Extract<Item, { kind: 'icon' }>
    const icon = { ...(placeItem({ x: 0, y: 0 }, { ...DEFAULT_STYLE, size: 100 }, { items: [], crop: null }) as Icon), rotation: 90 }
    const center = (item: Icon) => {
      const half = item.size / 2
      return [Math.round(item.x - half), Math.round(item.y + half)]
    }
    const smaller = applyStyle(icon, { size: 40 }) as Icon
    expect(center(smaller)).toEqual(center(icon))
  })
})

describe('reorder', () => {
  const items = ['a', 'b', 'c', 'd'].map((id) => ({ id }) as Item)
  const order = (ids: string[], action: Parameters<typeof reorder>[2]) => reorder(items, ids, action).map((item) => item.id).join('')

  it('맨 앞, 맨 뒤 (여러 개는 서로 순서 유지)', () => {
    expect(order(['a'], 'front')).toBe('bcda')
    expect(order(['d'], 'back')).toBe('dabc')
    expect(order(['a', 'c'], 'front')).toBe('bdac')
  })

  it('한 칸 앞, 한 칸 뒤', () => {
    expect(order(['b'], 'forward')).toBe('acbd')
    expect(order(['d'], 'forward')).toBe('abcd')
    expect(order(['c'], 'backward')).toBe('acbd')
    expect(order(['a', 'b'], 'forward')).toBe('cabd')
  })
})

describe('custom colors', () => {
  it('새 색은 맨 앞, 같은 색은 앞으로 옮김, 최대 8개', () => {
    expect(addCustomColor(['#111111', '#222222'], '#222222')).toEqual(['#222222', '#111111'])
    expect(addCustomColor([], '#ABCDEF')).toEqual(['#abcdef'])
    const full = Array.from({ length: 8 }, (_, i) => `#00000${i}`)
    expect(addCustomColor(full, '#123456')).toEqual(['#123456', ...full.slice(0, 7)])
  })

  it('기본 색과 같으면 저장하지 않음', () => {
    expect(addCustomColor(['#111111'], '#FF3B30')).toEqual(['#111111'])
  })
})

describe('toolKeyAction', () => {
  const key = (key: string, code: string, extra: Partial<KeyboardEvent> = {}) => ({ key, code, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...extra })

  it('도구 줄 순서대로 숫자 키 (숫자판 포함)', () => {
    expect(toolKeyAction(key('1', 'Digit1'), false)).toBe('select')
    expect(toolKeyAction(key('6', 'Digit6'), false)).toBe('mosaic')
    expect(toolKeyAction(key('9', 'Numpad9'), false)).toBe('crop')
    expect(toolKeyAction(key('v', 'KeyV'), false)).toBeNull()
  })

  it('확대 키, Shift가 필요한 +도 받음', () => {
    expect(toolKeyAction(key('+', 'Equal', { shiftKey: true }), false)).toBe('zoomIn')
    expect(toolKeyAction(key('=', 'Equal'), false)).toBe('zoomIn')
    expect(toolKeyAction(key('-', 'Minus'), false)).toBe('zoomOut')
    expect(toolKeyAction(key('0', 'Digit0'), false)).toBe('zoomFit')
  })

  it('다른 키와 같이 누르거나 글자 입력 중이면 무시 (Cmd+숫자 크롬 탭 이동과 겹치지 않음)', () => {
    expect(toolKeyAction(key('1', 'Digit1', { metaKey: true }), false)).toBeNull()
    expect(toolKeyAction(key('1', 'Digit1', { ctrlKey: true }), false)).toBeNull()
    expect(toolKeyAction(key('!', 'Digit1', { shiftKey: true }), false)).toBeNull()
    expect(toolKeyAction(key('2', 'Digit2'), true)).toBeNull()
  })

  it('누르고 있으면 옮기는 키는 맥 Cmd, 그 외 Ctrl', () => {
    expect(isHoldKey({ key: 'Meta' }, true)).toBe(true)
    expect(isHoldKey({ key: 'Control' }, true)).toBe(false)
    expect(isHoldKey({ key: 'Control' }, false)).toBe(true)
  })
})
