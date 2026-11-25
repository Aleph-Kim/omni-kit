/** 요소가 너무 많으면 konva가 그리는 데 오래 걸려 편집 화면이 느려지므로 한 장에 넣을 수 있는 개수 */
export const MAX_ITEMS = 100

const KEY = 'captureItemLimit'

// 사용자가 끈 적이 없으면 제한을 켬
export async function loadItemLimit(): Promise<boolean> {
  const { [KEY]: limited } = await chrome.storage.local.get(KEY)
  return limited !== false
}

export const saveItemLimit = (limited: boolean) => chrome.storage.local.set({ [KEY]: limited })
