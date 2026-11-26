import { describe, expect, it } from 'vitest'
import { placeInFrames } from './frames'

const viewport = { width: 1000, height: 800 }

describe('placeInFrames', () => {
  it('화면 안에 다 보이는 iframe 하나는 위치 그대로, 전체가 보임', () => {
    expect(placeInFrames([{ x: 100, y: 50, width: 400, height: 300, scale: 1 }], viewport)).toEqual({
      x: 100,
      y: 50,
      scale: 1,
      visible: { x: 0, y: 0, width: 400, height: 300 },
    })
  })

  it('중첩 iframe은 바깥 위치를 더함', () => {
    const frames = [
      { x: 10, y: 20, width: 100, height: 100, scale: 1 },
      { x: 100, y: 50, width: 400, height: 300, scale: 1 },
    ]
    expect(placeInFrames(frames, viewport)).toEqual({ x: 110, y: 70, scale: 1, visible: { x: 0, y: 0, width: 100, height: 100 } })
  })

  it('바깥 iframe 밖으로 나간 안쪽 iframe은 바깥 iframe이 보이는 곳으로 자름', () => {
    const frames = [
      { x: 300, y: -50, width: 200, height: 200, scale: 1 },
      { x: 100, y: 50, width: 400, height: 300, scale: 1 },
    ]
    expect(placeInFrames(frames, viewport)).toEqual({ x: 400, y: 0, scale: 1, visible: { x: 0, y: 50, width: 100, height: 150 } })
  })

  it('화면 밖으로 걸친 iframe은 화면 안 부분만 보임', () => {
    expect(placeInFrames([{ x: -100, y: 600, width: 400, height: 300, scale: 1 }], viewport)).toEqual({
      x: -100,
      y: 600,
      scale: 1,
      visible: { x: 100, y: 0, width: 300, height: 200 },
    })
  })

  it('transform으로 반으로 줄인 iframe은 안쪽 좌표를 배율로 바꿈', () => {
    expect(placeInFrames([{ x: 105, y: 155, width: 600, height: 400, scale: 0.5 }], viewport)).toEqual({
      x: 105,
      y: 155,
      scale: 0.5,
      visible: { x: 0, y: 0, width: 600, height: 400 },
    })
  })

  it('줄인 iframe 안의 중첩 iframe은 바깥 배율만큼 위치와 크기가 줄어듦', () => {
    const frames = [
      { x: 300, y: 200, width: 250, height: 150, scale: 1 },
      { x: 0, y: 0, width: 600, height: 400, scale: 0.5 },
    ]
    expect(placeInFrames(frames, viewport)).toEqual({ x: 150, y: 100, scale: 0.5, visible: { x: 0, y: 0, width: 250, height: 150 } })
  })
})
