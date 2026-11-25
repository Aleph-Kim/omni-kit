export type Size = { width: number; height: number }
export type WorkMode = 'fill' | 'resize'
export type Work = { mode: WorkMode; size: Size | null }

const KEY = 'captureWorkArea'
const MIN: Size = { width: 320, height: 240 }
const MARGIN = 16
const DEFAULT: Work = { mode: 'fill', size: null }

/** 조절 모드 작업 칸 크기, 처음은 영역의 80%, 최대는 사방 여백을 뺀 영역 (영역이 최소보다 작으면 영역에 맞춤) */
export function workSize(saved: Size | null, area: Size): Size {
  const size = saved ?? { width: Math.round(area.width * 0.8), height: Math.round(area.height * 0.8) }
  return { width: limit(size.width, MIN.width, area.width - 2 * MARGIN), height: limit(size.height, MIN.height, area.height - 2 * MARGIN) }
}

/** 손잡이를 끈 만큼 바뀐 크기, 가운데 정렬이라 반대쪽도 같이 늘어나서 끈 거리의 2배 */
export const dragWorkSize = (start: Size, delta: { dx: number; dy: number }, area: Size) =>
  workSize({ width: start.width + 2 * delta.dx, height: start.height + 2 * delta.dy }, area)

const limit = (value: number, min: number, max: number) => Math.max(Math.min(min, max), Math.min(max, value))

export function parseWork(raw: unknown): Work {
  if (typeof raw !== 'object' || raw === null) return DEFAULT
  const { mode, size } = raw as Partial<Work>
  if (mode !== 'fill' && mode !== 'resize') return DEFAULT
  return { mode, size: isSize(size) ? size : null }
}

const isSize = (value: unknown): value is Size =>
  typeof value === 'object' &&
  value !== null &&
  [(value as Size).width, (value as Size).height].every((each) => typeof each === 'number' && Number.isFinite(each) && each > 0)

export async function loadWork(): Promise<Work> {
  const { [KEY]: work } = await chrome.storage.local.get(KEY)
  return parseWork(work)
}

export const saveWork = (work: Work) => chrome.storage.local.set({ [KEY]: work })
