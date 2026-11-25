import type { ComponentType } from 'react'
import { BookmarkShortcutsPanel } from './bookmark-shortcuts/Panel'
import { CapturePanel } from './capture/Panel'

export type Feature = {
  id: string
  titleKey: string
  // 섹션 제목은 Panel이 그림 (제목 줄 끝에 버튼을 두는 기능이 있음)
  Panel: ComponentType<{ titleId: string; title: string }>
}

// 기능 폴더(src/features/<id>)를 추가할 때마다 여기에 등록
export const features: Feature[] = [
  { id: 'capture', titleKey: 'captureTitle', Panel: CapturePanel },
  { id: 'bookmark-shortcuts', titleKey: 'bookmarkShortcutsTitle', Panel: BookmarkShortcutsPanel },
]
