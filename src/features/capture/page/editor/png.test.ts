import { describe, expect, it } from 'vitest'
import { crc32, withPixelDensity } from './png'

const ascii = (value: string) => Uint8Array.from(value, (c) => c.charCodeAt(0))

function chunk(type: string, data: number[]): number[] {
  const body = [...ascii(type), ...data]
  const crc = crc32(Uint8Array.from(body))
  return [0, 0, 0, data.length, ...body, crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff]
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const IHDR = chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0])
const IDAT = chunk('IDAT', [1, 2, 3])
const IEND = chunk('IEND', [])

function chunks(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  const list = []
  for (let at = 8; at < png.length; ) {
    const length = view.getUint32(at)
    const type = String.fromCharCode(...png.subarray(at + 4, at + 8))
    list.push({ type, length, data: png.subarray(at + 8, at + 8 + length), crc: view.getUint32(at + 8 + length), body: png.subarray(at + 4, at + 8 + length) })
    at += 12 + length
  }
  return list
}

describe('crc32', () => {
  it('알려진 값과 같음', () => {
    expect(crc32(ascii('IEND'))).toBe(0xae426082)
    expect(crc32(ascii('123456789'))).toBe(0xcbf43926)
  })
})

describe('withPixelDensity', () => {
  it('IHDR 바로 뒤에 pHYs를 넣고 나머지 청크는 그대로', () => {
    const png = Uint8Array.from([...SIGNATURE, ...IHDR, ...IDAT, ...IEND])
    const result = withPixelDensity(png, 2)
    expect([...result.subarray(0, 8)]).toEqual(SIGNATURE)
    expect(result.length).toBe(png.length + 21)
    const list = chunks(result)
    expect(list.map(({ type }) => type)).toEqual(['IHDR', 'pHYs', 'IDAT', 'IEND'])
    for (const { crc, body } of list) expect(crc).toBe(crc32(body))
    const density = list[1]
    expect(density.length).toBe(9)
    const view = new DataView(density.data.buffer, density.data.byteOffset, 9)
    // 144dpi
    expect(view.getUint32(0)).toBe(5669)
    expect(view.getUint32(4)).toBe(5669)
    expect(density.data[8]).toBe(1)
  })

  it('이미 있던 pHYs는 하나로 바꿈', () => {
    const png = Uint8Array.from([...SIGNATURE, ...IHDR, ...chunk('pHYs', [0, 0, 11, 19, 0, 0, 11, 19, 1]), ...IDAT, ...IEND])
    const list = chunks(withPixelDensity(png, 1.5))
    expect(list.map(({ type }) => type)).toEqual(['IHDR', 'pHYs', 'IDAT', 'IEND'])
    expect(new DataView(list[1].data.buffer, list[1].data.byteOffset, 9).getUint32(0)).toBe(Math.round(108 / 0.0254))
  })
})
