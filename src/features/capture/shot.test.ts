import { describe, expect, it } from 'vitest'
import { MAX_SHOTS, captureBlockReason, captureSupport, deviceScale, fileName, scrollPositions, sliceDraw, splitParts, toImageRect, type DrawArgs } from './shot'

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

describe('sliceDraw', () => {
  const SCALES = [1, 1.1, 1.25, 1.5, 1.75, 2, 2.2, 2.5, 3, 1.8, 1.34]

  // 찍힌 그림 밖을 읽지 않는지 확인하고 칠한 칸 표시
  function paint(drawn: Uint8Array, rowWidth: number, draws: DrawArgs[], image: { width: number; height: number }) {
    for (const [sx, sy, sw, sh, dx, dy, dw, dh] of draws) {
      expect(sx >= 0 && sy >= 0 && sw > 0 && sh > 0 && sx + sw <= image.width && sy + sh <= image.height).toBe(true)
      for (let y = dy; y < dy + dh; y++) drawn.fill(1, y * rowWidth + dx, y * rowWidth + Math.min(rowWidth, dx + dw))
    }
  }

  it('여러 배율과 화면 높이에서 한 화면씩 내려 찍은 조각 사이에 빈 줄이 없음', () => {
    for (const scale of SCALES) {
      for (let viewport = 500; viewport <= 1400; viewport += 7) {
        const total = viewport * 7 + 123
        const image = { width: Math.round(8 * scale), height: Math.round(viewport * scale) }
        const height = Math.round(total * scale)
        const drawn = new Uint8Array((height + 2) * image.width)
        for (const top of scrollPositions(total, viewport)) paint(drawn, image.width, sliceDraw({ x: 0, y: 0, width: 8, height: viewport }, 0, top, scale, image), image)
        expect(drawn.subarray(0, height * image.width).includes(0), `${scale} ${viewport}`).toBe(false)
      }
    }
  })

  it('가로로 이어 붙여도 빈 칸이 없음', () => {
    for (const scale of SCALES) {
      const image = { width: Math.round(333 * scale), height: Math.round(10 * scale) }
      const width = Math.round(3330 * scale)
      const drawn = new Uint8Array(image.height * width)
      for (let left = 0; left < 3330; left += 333) paint(drawn, width, sliceDraw({ x: 0, y: 0, width: 333, height: 10 }, left, 0, scale, image), image)
      expect(drawn.includes(0), `${scale}`).toBe(false)
    }
  })

  it('영역보다 큰 그림에서도 영역 바깥 줄을 읽지 않음', () => {
    const rect = { x: 0, y: 101, width: 10, height: 601 }
    for (let viewport = 500; viewport <= 1400; viewport += 7) {
      for (const draw of sliceDraw(rect, 0, 0, 1.5, { width: 15, height: Math.round(viewport * 1.5) })) {
        expect(draw[1]).toBeGreaterThanOrEqual(152)
        expect(draw[1] + draw[3]).toBeLessThanOrEqual(1053)
      }
    }
  })

  it('가로도 영역 바깥 줄을 읽지 않음', () => {
    const rect = { x: 101, y: 0, width: 601, height: 10 }
    for (let viewport = 500; viewport <= 1400; viewport += 7) {
      for (const draw of sliceDraw(rect, 0, 0, 1.5, { width: Math.round(viewport * 1.5), height: 15 })) {
        expect(draw[0]).toBeGreaterThanOrEqual(152)
        expect(draw[0] + draw[2]).toBeLessThanOrEqual(1053)
      }
    }
  })

  it('원본을 늘리지 않고 같은 크기로 자름', () => {
    expect(sliceDraw({ x: 10, y: 20, width: 100, height: 50 }, 0, 300, 2, { width: 1000, height: 1000 })).toEqual([[20, 40, 200, 100, 0, 600, 200, 100]])
  })

  it('찍힌 그림이 1px 모자라면 끝 줄을 한 번 더 그림', () => {
    expect(sliceDraw({ x: 0, y: 0, width: 10, height: 101 }, 0, 0.2, 1.5, { width: 15, height: 151 })).toEqual([
      [0, 0, 15, 151, 0, 0, 15, 151],
      [0, 150, 15, 1, 0, 151, 15, 1],
    ])
  })
})

describe('deviceScale', () => {
  it('찍힌 그림 폭을 탭 폭으로 나눈 배율', () => {
    expect(deviceScale(2880, 1440)).toBe(2)
    expect(deviceScale(1800, 1440)).toBe(1.25)
    expect(deviceScale(2879, 1440)).toBe(2)
    expect(deviceScale(2880, undefined)).toBeUndefined()
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

describe('captureBlockReason', () => {
  it('크롬 기본 화면은 browser 이유', () => {
    expect(captureBlockReason('chrome://newtab/', false)).toBe('captureWhyBrowser')
    expect(captureBlockReason('about:blank', false)).toBe('captureWhyBrowser')
  })

  it('웹스토어는 store 이유', () => {
    expect(captureBlockReason('https://chromewebstore.google.com/detail/x', false)).toBe('captureWhyStore')
    expect(captureBlockReason('https://chrome.google.com/webstore/detail/x', false)).toBe('captureWhyStore')
  })

  it('파일 주소는 접근 허용이 꺼졌을 때만 file 이유', () => {
    expect(captureBlockReason('file:///a.pdf', false)).toBe('captureWhyFile')
    expect(captureBlockReason('file:///a.pdf', true)).toBeNull()
  })

  it('일반 웹페이지와 주소 없음은 이유 없음', () => {
    expect(captureBlockReason('https://example.com', false)).toBeNull()
    expect(captureBlockReason(undefined, false)).toBeNull()
  })
})
