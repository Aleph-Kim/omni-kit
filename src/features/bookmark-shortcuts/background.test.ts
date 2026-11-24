import { describe, expect, it } from 'vitest'
import { isSamePage } from './background'

describe('isSamePage', () => {
  it('주소가 같거나 # 뒤만 다르면 같은 페이지', () => {
    expect(isSamePage('https://www.naver.com/', 'https://www.naver.com/')).toBe(true)
    expect(isSamePage('https://www.naver.com/#top', 'https://www.naver.com/')).toBe(true)
  })

  it('하위 경로나 쿼리가 다르면 다른 페이지', () => {
    expect(isSamePage('https://www.naver.com/news', 'https://www.naver.com/')).toBe(false)
    expect(isSamePage('https://www.naver.com/?a=1', 'https://www.naver.com/')).toBe(false)
  })
})
