/**
 * 직접 로드한 개발 빌드는 툴바 아이콘에 주황 점을 찍어 스토어에서 설치한 출시 버전과 구분
 */
export async function markDevIcon() {
  const imageData: Record<string, ImageData> = {}
  for (const size of [16, 32]) {
    const icon = await createImageBitmap(await (await fetch(chrome.runtime.getURL(`icons/icon-${size}.png`))).blob())
    const canvas = new OffscreenCanvas(size, size)
    const context = canvas.getContext('2d')!
    context.drawImage(icon, 0, 0)
    // 진행 배지(%)와 실패 배지(!)가 아래쪽에 붙어서 점은 오른쪽 위
    const radius = size * 0.22
    context.beginPath()
    context.arc(size - radius - 1, radius + 1, radius, 0, Math.PI * 2)
    context.fillStyle = '#ff9500'
    context.fill()
    context.lineWidth = size / 16
    context.strokeStyle = '#fff'
    context.stroke()
    imageData[size] = context.getImageData(0, 0, size, size)
  }
  await chrome.action.setIcon({ imageData })
}
