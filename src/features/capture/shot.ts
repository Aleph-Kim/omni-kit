export type CaptureMode = 'area' | 'visible' | 'full'
export type CaptureSupport = 'full' | 'visible' | 'none'
export type ImageType = 'image/png' | 'image/jpeg' | 'image/webp'
export type Rect = { x: number; y: number; width: number; height: number }

// 무한 스크롤 페이지에서 끝없이 찍지 않도록 제한
export const MAX_SHOTS = 1000

// 크롬 캔버스 한도(한 변 32767)보다 작게 잡아 메모리 사용 제한
export const MAX_PART_HEIGHT = 16384

// 크롬이 확장의 코드 넣기를 막는 웹스토어
const WEBSTORE = [/^https:\/\/chromewebstore\.google\.com\//, /^https:\/\/chrome\.google\.com\/webstore/]

/**
 * 팝업에서 고를 수 있는 캡처 판별, 선택 영역과 전체 페이지는 페이지에 코드를 넣어야 해서 일반 웹페이지만 가능
 */
export function captureSupport(url: string | undefined, fileAccess: boolean): CaptureSupport {
  if (!url) return 'none'
  if (url.startsWith('file:')) return fileAccess ? 'full' : 'none'
  if (WEBSTORE.some((pattern) => pattern.test(url))) return 'visible'
  if (/^https?:/.test(url)) return 'full'
  return 'visible'
}

/**
 * 크롬 PDF 보기 여부, 스크롤은 크롬 내장 PDF 확장 안에서만 일어나 다른 확장이 내릴 수 없음
 */
export async function isPdf(tabId: number): Promise<boolean> {
  try {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId }, func: () => document.contentType })
    return result === 'application/pdf'
  } catch {
    return false
  }
}

/** iframe 안까지 찍을 때 요청하는 권한 주소 */
export const frameOriginPattern = (origin: string) => `${origin}/*`

/**
 * 전체 페이지를 한 화면씩 찍을 스크롤 위치, 마지막 장은 페이지 끝에 맞춰 앞 장과 겹침
 */
export function scrollPositions(total: number, viewport: number): number[] {
  const end = Math.min(total, viewport * MAX_SHOTS)
  const positions: number[] = []
  for (let y = 0; y < end - viewport; y += viewport) positions.push(y)
  positions.push(Math.max(0, end - viewport))
  return positions
}

/**
 * 화면 좌표(CSS 픽셀)를 찍힌 그림의 픽셀 좌표로 변환 (고해상도 화면과 페이지 확대 배율 반영)
 */
export function toImageRect(rect: Rect, scale: number): Rect {
  const x = Math.round(rect.x * scale)
  const y = Math.round(rect.y * scale)
  return { x, y, width: Math.round((rect.x + rect.width) * scale) - x, height: Math.round((rect.y + rect.height) * scale) - y }
}

/**
 * 긴 페이지를 한 장 최대 높이로 나눈 각 장의 시작 위치와 높이
 */
export function splitParts(height: number, max = MAX_PART_HEIGHT): { top: number; height: number }[] {
  const parts = []
  for (let top = 0; top < height; top += max) parts.push({ top, height: Math.min(max, height - top) })
  return parts
}

const EXTENSIONS: Record<ImageType, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

/**
 * 다운로드 파일 이름 (찍은 시각 기준), 여러 장으로 나뉜 페이지는 장 번호를 붙임
 */
export function fileName(date: Date, type: ImageType, part?: number): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  const time = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  return `screenshot-${day}-${time}${part === undefined ? '' : `-${part}`}.${EXTENSIONS[type]}`
}
