import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import manifest from '../manifest.config.ts'

const localesDir = new URL('../public/_locales/', import.meta.url)
const keysOf = (locale: string) =>
  Object.keys(JSON.parse(readFileSync(new URL(`${locale}/messages.json`, localesDir), 'utf8'))).sort()

describe('locales', () => {
  it('manifest의 __MSG_ 키가 기본 언어에 모두 있음', async () => {
    const resolved = typeof manifest === 'function' ? await manifest({ command: 'build', mode: 'production' }) : manifest
    const used = [...JSON.stringify(resolved).matchAll(/__MSG_(\w+)__/g)].map((m) => m[1])
    expect(used.length).toBeGreaterThan(0)
    expect(keysOf('en')).toEqual(expect.arrayContaining(used))
  })

  it('모든 언어가 기본 언어와 같은 키를 가짐', () => {
    for (const locale of readdirSync(localesDir)) expect(keysOf(locale), locale).toEqual(keysOf('en'))
  })
})
