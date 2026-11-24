import { describe, expect, it } from 'vitest'
import { SLOT_COUNT, barBookmarkIds, bookmarkLabel, commandName, normalizeSlots, slotIndexFromCommand } from './slots'

describe('slotIndexFromCommand', () => {
  it('칸 명령을 0부터 시작하는 번호로 변환', () => {
    expect(slotIndexFromCommand('open-bookmark-1')).toBe(0)
    expect(slotIndexFromCommand('open-bookmark-9')).toBe(8)
  })

  it('commandName과 서로 되돌릴 수 있음', () => {
    for (let i = 0; i < SLOT_COUNT; i++) expect(slotIndexFromCommand(commandName(i))).toBe(i)
  })

  it('범위 밖이나 다른 명령은 null', () => {
    for (const command of ['open-bookmark-0', 'open-bookmark-10', 'open-bookmark-', 'open-bookmark-1.5', 'other-1']) {
      expect(slotIndexFromCommand(command)).toBeNull()
    }
  })
})

describe('normalizeSlots', () => {
  it('저장값이 없으면 빈 칸으로 채움', () => {
    expect(normalizeSlots(undefined)).toEqual(Array(SLOT_COUNT).fill(null))
  })

  it('짧거나 긴 배열과 잘못된 값을 칸 수에 맞춰 정리', () => {
    const slots = normalizeSlots(['a', 3, null, ...Array(20).fill('x')])
    expect(slots).toHaveLength(SLOT_COUNT)
    expect(slots.slice(0, 4)).toEqual(['a', null, null, 'x'])
  })
})

describe('barBookmarkIds', () => {
  it('폴더를 건너뛰고 북마크바 순서대로 칸에 배치', () => {
    const bar = [
      { id: 'a', title: 'A', url: 'https://a.com' },
      { id: 'folder', title: '폴더', children: [] },
      { id: 'b', title: 'B', url: 'https://b.com' },
    ] as chrome.bookmarks.BookmarkTreeNode[]
    expect(barBookmarkIds(bar).slice(0, 3)).toEqual(['a', 'b', null])
  })
})

describe('bookmarkLabel', () => {
  it('이름이 있으면 이름 사용', () => {
    expect(bookmarkLabel('내 메일', 'https://mail.naver.com')).toBe('내 메일')
  })

  it('이름이 없으면 www를 뺀 도메인 사용', () => {
    expect(bookmarkLabel('', 'https://www.naver.com/')).toBe('naver.com')
    expect(bookmarkLabel('', 'https://claude.ai/new')).toBe('claude.ai')
  })

  it('도메인이 없는 주소는 주소 그대로', () => {
    expect(bookmarkLabel('', 'javascript:alert(1)')).toBe('javascript:alert(1)')
  })
})
