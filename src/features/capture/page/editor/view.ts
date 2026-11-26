import type { Rect } from '../../shot'

type Size = { width: number; height: number }

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4

/** 캔버스 한 변이 크롬 캔버스 한도(32767)를 넘지 않는 최대 배율 (고해상도 화면은 캔버스가 배율만큼 더 큼) */
export const maxZoom = (image: Size, dpr: number) => Math.min(MAX_ZOOM, 16000 / (dpr * Math.max(image.width, image.height)))

/** 그림 전체가 보이는 배율, 원래 크기(화면 점 1개에 그림 점 1개)보다 키우지 않음 (키우면 흐려짐) */
export const fitZoom = (image: Size, box: Size, dpr: number) =>
  Math.max(0.01, Math.min(1 / dpr, box.width / image.width, box.height / image.height))

/** 확대, 축소 버튼의 다음 배율, 화면에 보이는 값(배율 x 화면 배율)을 10% 단위로 반올림한 뒤 10%씩 (69%에서 확대하면 80%) */
export function stepZoom(current: number, direction: 1 | -1, max = MAX_ZOOM, dpr = globalThis.devicePixelRatio || 1): number {
  const next = Math.round(current * dpr * 10) + direction
  return Math.min(max, Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next / 10)) / dpr)
}

/** 끌기 시작점과 끝점으로 만든 영역 (거꾸로 끌어도 양수 크기), 그림 밖은 잘라냄 */
export function dragRect(a: { x: number; y: number }, b: { x: number; y: number }, bounds: Size): Rect {
  const x1 = clamp(Math.min(a.x, b.x), 0, bounds.width)
  const y1 = clamp(Math.min(a.y, b.y), 0, bounds.height)
  const x2 = clamp(Math.max(a.x, b.x), 0, bounds.width)
  const y2 = clamp(Math.max(a.y, b.y), 0, bounds.height)
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * 내보낼 때 konva toCanvas에 넘기는 값, 화면 확대 배율과 상관없이 자른 영역을 원본 픽셀 크기로 그림
 * offset은 화면에 보이는 영역의 그림 좌표 시작점 (자르기 중이 아니면 자른 영역의 시작점)
 */
export function exportArea(image: Size, crop: Rect | null, offset: { x: number; y: number }, zoom: number) {
  const rect = crop ? roundRect(crop) : { x: 0, y: 0, ...image }
  // konva가 floor(크기 * pixelRatio)로 캔버스를 만들어 소수 오차로 1px 줄지 않게 아주 작은 값을 더함
  return { x: (rect.x - offset.x) * zoom, y: (rect.y - offset.y) * zoom, width: rect.width * zoom + 1e-6, height: rect.height * zoom + 1e-6, pixelRatio: 1 / zoom }
}

export function roundRect(rect: Rect): Rect {
  const x = Math.round(rect.x)
  const y = Math.round(rect.y)
  return { x, y, width: Math.max(1, Math.round(rect.x + rect.width) - x), height: Math.max(1, Math.round(rect.y + rect.height) - y) }
}
