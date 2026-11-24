/**
 * 실패를 아이콘 배지로 알림 (빈 북마크 칸, 캡처할 수 없는 페이지 등)
 */
export async function flashBadge() {
  await chrome.action.setBadgeBackgroundColor({ color: '#ff3b30' })
  await chrome.action.setBadgeText({ text: '!' })
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500)
}
