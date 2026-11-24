import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import manifest from '../manifest.config.ts'

type Messages = Record<string, { message: string; placeholders?: Record<string, unknown> }>

const localesDir = new URL('../public/_locales/', import.meta.url)
const read = (locale: string): Messages => JSON.parse(readFileSync(new URL(`${locale}/messages.json`, localesDir), 'utf8'))
const keysOf = (locale: string) => Object.keys(read(locale)).sort()
const tokens = (text: string) => (text.match(/\$\w+\$/g) ?? []).sort()

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

  it('모든 언어의 자리표시자가 기본 언어와 같음', () => {
    const en = read('en')
    for (const locale of readdirSync(localesDir)) {
      const messages = read(locale)
      for (const key of Object.keys(en)) {
        expect(tokens(messages[key].message), `${locale}.${key}`).toEqual(tokens(en[key].message))
        expect(messages[key].placeholders, `${locale}.${key}`).toEqual(en[key].placeholders)
      }
    }
  })

  it('이름과 짧은 설명이 스토어 글자 수 제한 이내', () => {
    for (const locale of readdirSync(localesDir)) {
      const messages = read(locale)
      expect(messages.appName.message.length, locale).toBeLessThanOrEqual(75)
      expect(messages.appDesc.message.length, locale).toBeLessThanOrEqual(132)
    }
  })
})
