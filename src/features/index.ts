export type Feature = {
  id: string
  titleKey: string
}

// 기능 폴더(src/features/<id>)를 추가할 때마다 여기에 등록
export const features: Feature[] = []
