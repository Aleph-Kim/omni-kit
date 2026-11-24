import type { ComponentType } from 'react'
import { BookmarkShortcutsPanel } from './bookmark-shortcuts/Panel'
import { CapturePanel } from './capture/Panel'

export type Feature = {
  id: string
  titleKey: string
  Panel: ComponentType
}

// 기능 폴더(src/features/<id>)를 추가할 때마다 여기에 등록
export const features: Feature[] = [
  { id: 'capture', titleKey: 'captureTitle', Panel: CapturePanel },
  { id: 'bookmark-shortcuts', titleKey: 'bookmarkShortcutsTitle', Panel: BookmarkShortcutsPanel },
]
