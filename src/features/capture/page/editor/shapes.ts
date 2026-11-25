export const SHAPES = ['rect', 'roundRect', 'ellipse', 'triangle', 'diamond', 'hexagon', 'star', 'bubble', 'heart'] as const
export type ShapeName = (typeof SHAPES)[number]

export const SHAPE_LABEL: Record<ShapeName, string> = {
  rect: 'shapeRect',
  roundRect: 'shapeRoundRect',
  ellipse: 'shapeEllipse',
  triangle: 'shapeTriangle',
  diamond: 'shapeDiamond',
  hexagon: 'shapeHexagon',
  star: 'shapeStar',
  bubble: 'shapeBubble',
  heart: 'shapeHeart',
}

type PathTarget = {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void
  closePath(): void
}

// 원을 베지어 곡선 4개로 그릴 때 조절점 거리 비율
const KAPPA = 0.5523

/**
 * 끌어서 만든 w x h 상자에 맞춰 도형 윤곽을 그림, 캔버스(konva)와 속성 카드의 svg 미리보기가 같이 씀
 */
export function drawShape(path: PathTarget, shape: ShapeName, w: number, h: number) {
  const polygon = (points: [number, number][]) => {
    points.forEach(([x, y], index) => (index ? path.lineTo(x * w, y * h) : path.moveTo(x * w, y * h)))
    path.closePath()
  }
  switch (shape) {
    case 'rect':
      return polygon([[0, 0], [1, 0], [1, 1], [0, 1]])
    case 'roundRect':
      return roundRect(path, w, h, Math.min(w, h) * 0.2)
    case 'ellipse': {
      const [rx, ry] = [w / 2, h / 2]
      path.moveTo(w, ry)
      path.bezierCurveTo(w, ry + ry * KAPPA, rx + rx * KAPPA, h, rx, h)
      path.bezierCurveTo(rx - rx * KAPPA, h, 0, ry + ry * KAPPA, 0, ry)
      path.bezierCurveTo(0, ry - ry * KAPPA, rx - rx * KAPPA, 0, rx, 0)
      path.bezierCurveTo(rx + rx * KAPPA, 0, w, ry - ry * KAPPA, w, ry)
      return path.closePath()
    }
    case 'triangle':
      return polygon([[0.5, 0], [1, 1], [0, 1]])
    case 'diamond':
      return polygon([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]])
    case 'hexagon':
      return polygon([[0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]])
    case 'star': {
      // 꼭짓점 5개, 안쪽 반지름은 바깥의 0.4배, 첫 꼭짓점은 위. 상자를 꽉 채우게 늘림
      const points = Array.from({ length: 10 }, (_, index) => {
        const radius = index % 2 ? 0.4 : 1
        const angle = -Math.PI / 2 + (index * Math.PI) / 5
        return [radius * Math.cos(angle), radius * Math.sin(angle)] as [number, number]
      })
      const [minX, maxX] = [Math.min(...points.map(([x]) => x)), Math.max(...points.map(([x]) => x))]
      const [minY, maxY] = [Math.min(...points.map(([, y]) => y)), Math.max(...points.map(([, y]) => y))]
      return polygon(points.map(([x, y]) => [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)]))
    }
    case 'bubble': {
      // 몸통은 높이의 78%, 아래 왼쪽에 꼬리
      const body = h * 0.78
      const r = Math.min(w, body) * 0.2
      path.moveTo(r, 0)
      path.lineTo(w - r, 0)
      path.quadraticCurveTo(w, 0, w, r)
      path.lineTo(w, body - r)
      path.quadraticCurveTo(w, body, w - r, body)
      path.lineTo(w * 0.42, body)
      path.lineTo(w * 0.15, h)
      path.lineTo(w * 0.22, body)
      path.lineTo(r, body)
      path.quadraticCurveTo(0, body, 0, body - r)
      path.lineTo(0, r)
      path.quadraticCurveTo(0, 0, r, 0)
      return path.closePath()
    }
    case 'heart':
      path.moveTo(w * 0.5, h * 0.25)
      path.bezierCurveTo(w * 0.5, h * 0.05, 0, 0, 0, h * 0.35)
      path.bezierCurveTo(0, h * 0.6, w * 0.3, h * 0.75, w * 0.5, h)
      path.bezierCurveTo(w * 0.7, h * 0.75, w, h * 0.6, w, h * 0.35)
      path.bezierCurveTo(w, 0, w * 0.5, h * 0.05, w * 0.5, h * 0.25)
      return path.closePath()
  }
}

function roundRect(path: PathTarget, w: number, h: number, r: number) {
  path.moveTo(r, 0)
  path.lineTo(w - r, 0)
  path.quadraticCurveTo(w, 0, w, r)
  path.lineTo(w, h - r)
  path.quadraticCurveTo(w, h, w - r, h)
  path.lineTo(r, h)
  path.quadraticCurveTo(0, h, 0, h - r)
  path.lineTo(0, r)
  path.quadraticCurveTo(0, 0, r, 0)
  path.closePath()
}

/** 속성 카드 미리보기용 svg 경로 (24x24 안 3px 여백) */
export function shapeSvgPath(shape: ShapeName): string {
  const parts: string[] = []
  const at = (x: number, y: number) => `${+(x + 3).toFixed(2)} ${+(y + 3).toFixed(2)}`
  drawShape(
    {
      moveTo: (x, y) => parts.push(`M${at(x, y)}`),
      lineTo: (x, y) => parts.push(`L${at(x, y)}`),
      quadraticCurveTo: (cx, cy, x, y) => parts.push(`Q${at(cx, cy)} ${at(x, y)}`),
      bezierCurveTo: (c1x, c1y, c2x, c2y, x, y) => parts.push(`C${at(c1x, c1y)} ${at(c2x, c2y)} ${at(x, y)}`),
      closePath: () => parts.push('Z'),
    },
    shape,
    18,
    18,
  )
  return parts.join('')
}
