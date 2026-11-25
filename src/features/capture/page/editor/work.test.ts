import { describe, expect, it } from 'vitest'
import { dragWorkSize, parseWork, workSize } from './work'

const area = { width: 1000, height: 800 }

describe('workSize', () => {
  it('저장한 크기가 없으면 영역의 80%', () => {
    expect(workSize(null, area)).toEqual({ width: 800, height: 640 })
  })

  it('최소 크기보다 작으면 최소 크기', () => {
    expect(workSize({ width: 100, height: 50 }, area)).toEqual({ width: 320, height: 240 })
  })

  it('사방 여백을 뺀 영역보다 크지 않음', () => {
    expect(workSize({ width: 5000, height: 5000 }, area)).toEqual({ width: 968, height: 768 })
  })

  it('영역이 최소 크기보다 작으면 영역에 맞춤', () => {
    expect(workSize({ width: 400, height: 300 }, { width: 300, height: 200 })).toEqual({ width: 268, height: 168 })
  })
})

describe('dragWorkSize', () => {
  it('가운데 정렬이라 끈 거리의 2배', () => {
    expect(dragWorkSize({ width: 500, height: 400 }, { dx: 10, dy: -20 }, area)).toEqual({ width: 520, height: 360 })
  })

  it('한 방향만 끌면 다른 방향은 그대로', () => {
    expect(dragWorkSize({ width: 500, height: 400 }, { dx: 30, dy: 0 }, area)).toEqual({ width: 560, height: 400 })
  })

  it('최소와 최대를 넘지 않음', () => {
    expect(dragWorkSize({ width: 500, height: 400 }, { dx: 1000, dy: -1000 }, area)).toEqual({ width: 968, height: 240 })
  })
})

describe('parseWork', () => {
  it('저장한 값을 그대로', () => {
    expect(parseWork({ mode: 'resize', size: { width: 600, height: 400 } })).toEqual({ mode: 'resize', size: { width: 600, height: 400 } })
  })

  it('없거나 틀린 값은 꽉 채움', () => {
    expect(parseWork(undefined)).toEqual({ mode: 'fill', size: null })
    expect(parseWork({ mode: 'other', size: null })).toEqual({ mode: 'fill', size: null })
  })

  it('크기가 틀리면 크기만 버림', () => {
    expect(parseWork({ mode: 'resize', size: { width: 'a', height: 400 } })).toEqual({ mode: 'resize', size: null })
  })
})
