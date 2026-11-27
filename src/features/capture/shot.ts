export type CaptureMode = 'area' | 'element' | 'visible' | 'full'
export type CaptureSupport = 'full' | 'visible' | 'none'
export type ImageType = 'image/png' | 'image/jpeg' | 'image/webp'
export type Rect = { x: number; y: number; width: number; height: number }

// 무한 스크롤 페이지에서 끝없이 찍지 않도록 제한
export const MAX_SHOTS = 1000

// 크롬 캔버스 한도(한 변 32767)보다 작게 잡아 메모리 사용 제한
export const MAX_PART_HEIGHT = 16384

// 넓은 요소는 한 장 높이를 줄여 한 장의 픽셀 수를 이만큼으로 제한
export const MAX_PART_PIXELS = MAX_PART_HEIGHT * 4096

// 크롬이 확장의 코드 넣기를 막는 웹스토어
const WEBSTORE = [/^https:\/\/chromewebstore\.google\.com\//, /^https:\/\/chrome\.google\.com\/webstore/]

/**
 * 팝업에서 고를 수 있는 캡처 판별, 선택 영역, 요소, 전체 페이지는 페이지에 코드를 넣어야 해서 일반 웹페이지만 가능
 */
export function captureSupport(url: string | undefined, fileAccess: boolean): CaptureSupport {
  if (!url) return 'none'
  if (url.startsWith('file:')) return fileAccess ? 'full' : 'none'
  if (WEBSTORE.some((pattern) => pattern.test(url))) return 'visible'
  if (/^https?:/.test(url)) return 'full'
  return 'visible'
}

/**
 * 선택 영역, 요소, 전체 페이지를 못 쓰는 이유의 문구 키, 판별 순서는 captureSupport와 같음
 */
export function captureBlockReason(url: string | undefined, fileAccess: boolean): 'captureWhyFile' | 'captureWhyStore' | 'captureWhyBrowser' | null {
  if (!url) return null
  if (url.startsWith('file:')) return fileAccess ? null : 'captureWhyFile'
  if (WEBSTORE.some((pattern) => pattern.test(url))) return 'captureWhyStore'
  return /^https?:/.test(url) ? null : 'captureWhyBrowser'
}

/**
 * 전체 페이지를 못 찍는 페이지의 안내 문구 키
 * 크롬 PDF 보기는 스크롤이 크롬 내장 PDF 확장 안에서만 일어나 다른 확장이 내릴 수 없고,
 * 화면 절반 이상이 canvas(Figma 디자인 화면 등)면 내용이 그림 한 장이라 스크롤해 이어 붙일 것이 없음
 */
export async function fullPageBlock(tabId: number): Promise<'captureNoFullPdf' | 'captureNoFullCanvas' | null> {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (document.contentType === 'application/pdf') return 'captureNoFullPdf'
        for (const canvas of document.querySelectorAll('canvas')) {
          const box = canvas.getBoundingClientRect()
          const width = Math.min(box.right, innerWidth) - Math.max(box.left, 0)
          const height = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0)
          if (width > 0 && height > 0 && width * height >= innerWidth * innerHeight * 0.5) return 'captureNoFullCanvas'
        }
        return null
      },
    })
    return result ?? null
  } catch {
    return null
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

/** drawImage에 넘길 원본 x, y, 폭, 높이와 그릴 x, y, 폭, 높이 */
export type DrawArgs = [number, number, number, number, number, number, number, number]

/**
 * 찍은 화면 조각을 이어 붙일 drawImage 인자, 장마다 따로 반올림하면 이웃 조각 사이에 빈 줄이 생겨 그림 쪽 끝 좌표의 반올림 차로 크기를 정함
 * 원본은 늘림 없이 같은 크기로 자르되 영역 안과 찍힌 그림 안만 읽고, 1px 모자라면 끝 줄을 한 번 더 그림 (영역 바깥 줄은 다음 조각이 덮지 않아 이음매로 남음)
 */
export function sliceDraw(rect: Rect, left: number, top: number, scale: number, image: { width: number; height: number }): DrawArgs[] {
  const dx = Math.round(left * scale)
  const dy = Math.round(top * scale)
  const width = Math.round((left + rect.width) * scale) - dx
  const height = Math.round((top + rect.height) * scale) - dy
  const src = toImageRect(rect, scale)
  const left0 = Math.max(0, src.x)
  const top0 = Math.max(0, src.y)
  const right = Math.min(src.x + src.width, image.width)
  const bottom = Math.min(src.y + src.height, image.height)
  const sx = Math.max(left0, Math.min(src.x, right - width))
  const sy = Math.max(top0, Math.min(src.y, bottom - height))
  const sw = Math.min(width, right - sx)
  const sh = Math.min(height, bottom - sy)
  const draws: DrawArgs[] = [[sx, sy, sw, sh, dx, dy, sw, sh]]
  if (sh < height) draws.push([sx, sy + sh - 1, sw, 1, dx, dy + sh, sw, height - sh])
  if (sw < width) draws.push([sx + sw - 1, sy, 1, sh, dx + sw, dy, width - sw, height])
  return draws
}

/**
 * 찍힌 그림의 화면 배율, 페이지 확대는 빼고 다른 앱에서 화면에 보이던 크기로 열리게 함
 */
export const deviceScale = (imageWidth: number, tabWidth: number | undefined) => (tabWidth ? Math.round((imageWidth / tabWidth) * 100) / 100 : undefined)

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
