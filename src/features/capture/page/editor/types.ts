import type { Rect } from '../../shot'
import type { ShapeName } from './shapes'

export type Tool = 'select' | 'text' | 'arrow' | 'pen' | 'shape' | 'mosaic' | 'blur' | 'icon' | 'crop'
export type Font = 'system' | 'serif' | 'mono'

type Base = { id: string; x: number; y: number; rotation: number; scaleX: number; scaleY: number }

export type Item = Base &
  (
    | { kind: 'text'; text: string; color: string; font: Font; fontSize: number }
    | { kind: 'arrow'; points: number[]; color: string; thickness: number; curve: boolean }
    | { kind: 'pen'; points: number[]; color: string; thickness: number }
    | { kind: 'shape'; shape: ShapeName; width: number; height: number; color: string; fill: string | null; thickness: number }
    | { kind: 'mosaic' | 'blur'; width: number; height: number; strength: number }
    | { kind: 'icon'; icon: string; size: number; color: string }
    | { kind: 'number'; value: number; size: number; color: string }
  )

/** 한 장의 꾸미기 상태, 되돌리기 기록 한 칸 */
export type Doc = { items: Item[]; crop: Rect | null }

/** 다음에 그릴 요소의 값, 고른 요소가 있으면 그 요소의 값으로 바뀜 */
export type Style = { color: string; fill: string | null; thickness: number; font: Font; fontSize: number; icon: string; size: number; curve: boolean; shape: ShapeName; strength: number }

export const FONT_FAMILY: Record<Font, string> = {
  system: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, Menlo, monospace',
}

export const newId = () => `i${crypto.randomUUID().slice(0, 8)}`
