import { describe, expect, it } from 'vitest'
import { MAX_SHOTS, captureSupport, fileName, scrollPositions, splitParts, toImageRect } from './shot'

describe('captureSupport', () => {
  it('일반 웹페이지는 세 가지 모두 가능', () => {
    expect(captureSupport('https://example.com/a', false)).toBe('full')
    expect(captureSupport('http://localhost:3000/', false)).toBe('full')
  })

  it('코드를 넣을 수 없는 페이지는 보이는 화면만', () => {
    for (const url of ['chrome://settings/', 'chrome-extension://abc/page.html', 'about:blank', 'https://chromewebstore.google.com/detail/x', 'https://chrome.google.com/webstore/detail/x']) {
      expect(captureSupport(url, false), url).toBe('visible')
    }
  })

  it('내 컴퓨터 파일은 파일 URL 접근을 허용했을 때만 가능', () => {
    expect(captureSupport('file:///Users/me/a.html', true)).toBe('full')
    expect(captureSupport('file:///Users/me/a.html', false)).toBe('none')
  })

  it('주소를 모르면 불가', () => {
    expect(captureSupport(undefined, true)).toBe('none')
  })
})

describe('scrollPositions', () => {
  it('한 화면 이하면 한 번만 찍음', () => {
    expect(scrollPositions(800, 900)).toEqual([0])
    expect(scrollPositions(900, 900)).toEqual([0])
  })

  it('마지막 장은 페이지 끝에 맞춰 앞 장과 겹침', () => {
    expect(scrollPositions(3000, 900)).toEqual([0, 900, 1800, 2100])
  })

  it('화면 높이로 나누어떨어지면 겹치지 않음', () => {
    expect(scrollPositions(1800, 900)).toEqual([0, 900])
  })

  it('최대 장수를 넘는 페이지는 앞부분만 찍음', () => {
    const positions = scrollPositions(900 * MAX_SHOTS + 1, 900)
    expect(positions).toHaveLength(MAX_SHOTS)
    expect(positions.at(-1)).toBe(900 * (MAX_SHOTS - 1))
  })
})

describe('toImageRect', () => {
  it('배율 2에서 좌표와 크기를 두 배로', () => {
    expect(toImageRect({ x: 10, y: 20, width: 100, height: 50 }, 2)).toEqual({ x: 20, y: 40, width: 200, height: 100 })
  })

  it('소수 배율에서 끝 좌표 기준으로 반올림해 이웃 영역과 틈이 생기지 않음', () => {
    const left = toImageRect({ x: 0, y: 0, width: 33, height: 10 }, 1.5)
    const right = toImageRect({ x: 33, y: 0, width: 33, height: 10 }, 1.5)
    expect(left.x + left.width).toBe(right.x)
  })
})

describe('splitParts', () => {
  it('한도 이하면 한 장', () => {
    expect(splitParts(1000, 1000)).toEqual([{ top: 0, height: 1000 }])
  })

  it('한도를 넘으면 마지막 장은 남은 높이만', () => {
    expect(splitParts(2500, 1000)).toEqual([
      { top: 0, height: 1000 },
      { top: 1000, height: 1000 },
      { top: 2000, height: 500 },
    ])
  })
})

describe('fileName', () => {
  const date = new Date(2026, 10, 24, 20, 38, 12)

  it('screenshot-날짜-시간 형식', () => {
    expect(fileName(date, 'image/png')).toBe('screenshot-20261124-203812.png')
    expect(fileName(new Date(2026, 0, 5, 7, 8, 9), 'image/png')).toBe('screenshot-20260105-070809.png')
  })

  it('형식에 맞는 확장자', () => {
    expect(fileName(date, 'image/jpeg')).toBe('screenshot-20261124-203812.jpg')
    expect(fileName(date, 'image/webp')).toBe('screenshot-20261124-203812.webp')
  })

  it('나뉜 페이지는 장 번호를 붙임', () => {
    expect(fileName(date, 'image/png', 2)).toBe('screenshot-20261124-203812-2.png')
  })
})
