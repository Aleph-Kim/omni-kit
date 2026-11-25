import { PALETTE } from './palette'

const KEY = 'captureCustomColors'
const MAX = 8

/** 직접 고른 색을 맨 앞에 추가 (같은 색은 앞으로 옮김), 기본 색 8개와 같으면 저장하지 않음 */
export function addCustomColor(colors: string[], color: string): string[] {
  const value = color.toLowerCase()
  if (PALETTE.some((each) => each.value === value)) return colors
  return [value, ...colors.filter((each) => each !== value)].slice(0, MAX)
}

export async function loadCustomColors(): Promise<string[]> {
  const { [KEY]: colors } = await chrome.storage.local.get(KEY)
  return Array.isArray(colors) ? colors : []
}

export const saveCustomColors = (colors: string[]) => chrome.storage.local.set({ [KEY]: colors })
