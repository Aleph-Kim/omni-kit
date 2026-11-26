const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const SIGNATURE = 8
const text = (bytes: Uint8Array) => String.fromCharCode(...bytes)

/**
 * 고해상도 화면에서 찍은 PNG가 다른 앱에서 화면에 보이던 크기로 열리게 pHYs(72dpi 곱하기 배율)를 IHDR 바로 뒤에 넣음, 이미 있던 pHYs는 바꿈
 */
export function withPixelDensity(png: Uint8Array, scale: number): Uint8Array<ArrayBuffer> {
  const ppm = Math.round((72 * scale) / 0.0254)
  const density = new Uint8Array(21)
  const view = new DataView(density.buffer)
  view.setUint32(0, 9)
  density.set([0x70, 0x48, 0x59, 0x73], 4)
  view.setUint32(8, ppm)
  view.setUint32(12, ppm)
  density[16] = 1
  view.setUint32(17, crc32(density.subarray(4, 17)))

  const source = new DataView(png.buffer, png.byteOffset, png.byteLength)
  const chunks: Uint8Array[] = [png.subarray(0, SIGNATURE)]
  for (let at = SIGNATURE; at < png.length; ) {
    const end = at + 12 + source.getUint32(at)
    const type = text(png.subarray(at + 4, at + 8))
    if (type !== 'pHYs') chunks.push(png.subarray(at, end))
    if (type === 'IHDR') chunks.push(density)
    at = end
  }
  const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
