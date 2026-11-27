export const SLOT_COUNT = 9

const STORAGE_KEY = 'bookmarkSlots'
const COMMAND_PREFIX = 'open-bookmark-'

export type Slots = Array<string | null>

export const commandName = (index: number) => `${COMMAND_PREFIX}${index + 1}`

export function slotIndexFromCommand(command: string): number | null {
  if (!command.startsWith(COMMAND_PREFIX)) return null
  const index = Number(command.slice(COMMAND_PREFIX.length)) - 1
  return Number.isInteger(index) && index >= 0 && index < SLOT_COUNT ? index : null
}

/**
 * 저장값이 없거나 칸 수가 바뀐 경우에도 SLOT_COUNT 길이로 맞춤
 */
export function normalizeSlots(value: unknown): Slots {
  const stored: unknown[] = Array.isArray(value) ? value : []
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const id = stored[i]
    return typeof id === 'string' ? id : null
  })
}

/**
 * 직접 고르지 않은 칸에 쓰는 북마크바 순서의 북마크 (폴더 제외)
 */
export function barBookmarkIds(bar: chrome.bookmarks.BookmarkTreeNode[]): Slots {
  return normalizeSlots(bar.filter((node) => node.url).map((node) => node.id))
}

export async function loadBarBookmarkIds(): Promise<Slots> {
  const [root] = await chrome.bookmarks.getTree()
  // 트리의 첫 자식이 북마크바
  return barBookmarkIds(root?.children?.[0]?.children ?? [])
}

/**
 * 팝업 표시 이름, 아이콘만 둔 북마크바처럼 이름이 비면 도메인으로 대체
 */
export function bookmarkLabel(title: string, url: string): string {
  if (title) return title
  try {
    // javascript: 북마클릿처럼 도메인이 없는 주소는 주소 그대로
    return new URL(url).hostname.replace(/^www\./, '') || url
  } catch {
    return url
  }
}

export async function loadSlots(): Promise<Slots> {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  return normalizeSlots(stored[STORAGE_KEY])
}

export async function saveSlot(index: number, bookmarkId: string | null): Promise<Slots> {
  const slots = await loadSlots()
  slots[index] = bookmarkId
  await chrome.storage.local.set({ [STORAGE_KEY]: slots })
  return slots
}

const OPEN_IN_KEY = 'bookmarkOpenIn'

export type OpenIn = 'new-tab' | 'current-tab'

export async function loadOpenIn(): Promise<OpenIn> {
  const stored = await chrome.storage.local.get(OPEN_IN_KEY)
  return stored[OPEN_IN_KEY] === 'current-tab' ? 'current-tab' : 'new-tab'
}

export async function saveOpenIn(openIn: OpenIn) {
  await chrome.storage.local.set({ [OPEN_IN_KEY]: openIn })
}
