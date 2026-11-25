import type { Tool } from './types'

export type EditorAction = 'undo' | 'redo' | 'delete' | 'escape' | 'copy' | 'paste'

type KeyInput = Pick<KeyboardEvent, 'key' | 'code' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>

export const IS_MAC = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

/**
 * 편집 화면 키 판별, 글자 입력 중에는 입력 칸의 기본 동작을 살리려고 가로채지 않음
 * 한글, 아랍어 자판처럼 영어 글자가 나오지 않으면 자판 위치(code)로 판별, 프랑스어 자판은 Z 위치가 달라 글자(key)를 먼저 봄
 */
export function editorAction(event: KeyInput, mac: boolean, typing: boolean): EditorAction | null {
  if (typing || event.altKey) return null
  if (event.key === 'Escape') return 'escape'
  const modifier = mac ? event.metaKey : event.ctrlKey
  if (!modifier) return event.key === 'Delete' || event.key === 'Backspace' ? 'delete' : null
  const letter = /^[a-z]$/i.test(event.key) ? event.key.toLowerCase() : /^Key[A-Z]$/.test(event.code) ? event.code.slice(3).toLowerCase() : ''
  if (letter === 'z') return event.shiftKey ? 'redo' : 'undo'
  if (letter === 'y' && !mac && !event.shiftKey) return 'redo'
  if (event.shiftKey) return null
  if (letter === 'c') return 'copy'
  if (letter === 'v') return 'paste'
  return null
}

const LABELS: Partial<Record<EditorAction, [mac: string, other: string]>> = {
  undo: ['⌘Z', 'Ctrl+Z'],
  redo: ['⇧⌘Z', 'Ctrl+Shift+Z'],
  delete: ['⌫', 'Delete'],
}

/** 버튼 도움말에 붙이는 키 표시 */
export const keyLabel = (action: EditorAction, mac = IS_MAC) => LABELS[action]?.[mac ? 0 : 1] ?? ''

// 도구 줄 순서대로 숫자 키
export const TOOL_KEYS: Record<Tool, string> = { select: '1', text: '2', arrow: '3', pen: '4', shape: '5', mosaic: '6', blur: '7', icon: '8', crop: '9' }

export type ToolKeyAction = Tool | 'zoomIn' | 'zoomOut' | 'zoomFit'

/**
 * 도구와 확대 단축키 판별 (다른 키와 같이 누르면 무시, 글자 입력 중 무시), 확대는 Shift가 필요한 +도 받음
 */
export function toolKeyAction(event: KeyInput, typing: boolean): ToolKeyAction | null {
  if (typing || event.metaKey || event.ctrlKey || event.altKey) return null
  if (event.key === '+' || event.key === '=') return 'zoomIn'
  if (event.key === '-') return 'zoomOut'
  if (event.key === '0') return 'zoomFit'
  if (event.shiftKey) return null
  return (Object.keys(TOOL_KEYS) as Tool[]).find((tool) => TOOL_KEYS[tool] === event.key) ?? null
}

/** 누르고 있는 동안 잠깐 선택 도구로 바꾸는 키 (맥은 Cmd, 그 외는 Ctrl) */
export const isHoldKey = (event: Pick<KeyboardEvent, 'key'>, mac: boolean) => event.key === (mac ? 'Meta' : 'Control')

export const holdKeyLabel = (mac = IS_MAC) => (mac ? '⌘' : 'Ctrl')
