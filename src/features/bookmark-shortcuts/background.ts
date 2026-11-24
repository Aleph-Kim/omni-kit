import { flashBadge } from '../../badge'
import { loadBarBookmarkIds, loadSlots, slotIndexFromCommand } from './slots'

export async function openBookmarkSlot(command: string) {
  const index = slotIndexFromCommand(command)
  if (index === null) return
  const bookmarkId = (await loadSlots())[index] ?? (await loadBarBookmarkIds())[index]
  const url = bookmarkId ? await bookmarkUrl(bookmarkId) : null
  if (url) {
    try {
      if (await focusOpenTab(url)) return
      await chrome.tabs.create({ url })
      return
    } catch (error) {
      // javascript: 북마클릿 등 탭으로 열 수 없는 주소
      console.warn('failed to open bookmark', error)
    }
  }
  await flashBadge()
}

/**
 * 같은 주소의 탭이 이미 열려 있으면 새로 열지 않고 그 탭으로 이동, 경로나 쿼리가 다르면 다른 페이지로 취급
 */
async function focusOpenTab(url: string): Promise<boolean> {
  const tab = (await chrome.tabs.query({})).find((tab) => tab.url && isSamePage(tab.url, url))
  if (tab?.id === undefined) return false
  await chrome.tabs.update(tab.id, { active: true })
  await chrome.windows.update(tab.windowId, { focused: true })
  return true
}

/**
 * 페이지 안 위치(#)만 다른 주소는 같은 페이지
 */
export function isSamePage(a: string, b: string): boolean {
  try {
    const [left, right] = [new URL(a), new URL(b)]
    left.hash = ''
    right.hash = ''
    return left.href === right.href
  } catch {
    return a === b
  }
}

async function bookmarkUrl(id: string): Promise<string | null> {
  try {
    const [node] = await chrome.bookmarks.get(id)
    return node?.url ?? null
  } catch {
    // 연결 후 삭제된 북마크
    return null
  }
}
