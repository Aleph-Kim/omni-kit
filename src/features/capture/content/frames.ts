import type { Rect } from '../shot'

// 같은 출처 iframe 안에서 고른 요소 표시, 그 프레임에 넣는 page-scroll은 고르기 화면과 전역 객체가 달라서 DOM으로 넘김
export const PICKED_ATTR = 'data-omni-kit-picked'

/**
 * 고른 요소가 있는 iframe의 위치
 * x, y는 그 iframe 내용 영역의 맨 위 화면 좌표, scale은 iframe 안 1px이 맨 위 화면에서 차지하는 크기(transform으로 줄인 iframe은 1보다 작음)
 * visible은 그 iframe 중 실제로 보이는 부분(프레임 안 좌표)
 */
export type PickedFrame = { x: number; y: number; scale: number; visible: Rect; viewportWidth: number }

/** iframe 내용 영역의 바깥 문서 화면 위치, 크기는 iframe 안 좌표, scale은 그 iframe 안 1px의 바깥 문서 화면 크기 */
export type FrameBox = Rect & { scale: number }

/**
 * 안쪽부터 바깥 순서의 iframe 내용 영역(각자 바깥 문서 화면 좌표)을 맨 위 화면 기준 위치와 보이는 부분으로 바꿈
 */
export function placeInFrames(frames: FrameBox[], viewport: { width: number; height: number }): Omit<PickedFrame, 'viewportWidth'> {
  let x = 0
  let y = 0
  let scale = 1
  let clip: Rect = { x: 0, y: 0, width: viewport.width, height: viewport.height }
  for (const frame of [...frames].reverse()) {
    x += frame.x * scale
    y += frame.y * scale
    scale *= frame.scale
    clip = overlap(clip, { x, y, width: frame.width * scale, height: frame.height * scale })
  }
  return { x, y, scale, visible: { x: (clip.x - x) / scale, y: (clip.y - y) / scale, width: clip.width / scale, height: clip.height / scale } }
}

function overlap(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  return { x, y, width: Math.min(a.x + a.width, b.x + b.width) - x, height: Math.min(a.y + a.height, b.y + b.height) - y }
}
