import { useEffect, useState, type ReactNode } from 'react'
import { t } from '../../../i18n'
import { fileName, type ImageType } from '../shot'
import { loadCapture, type Capture } from '../store'

const TYPES: { type: ImageType; label: string }[] = [
  { type: 'image/png', label: 'PNG' },
  { type: 'image/jpeg', label: 'JPEG' },
  { type: 'image/webp', label: 'WebP' },
]
const RESOLUTIONS = [1, 0.5, 0.25]

const secondaryButton = 'rounded-lg bg-(--ok-cell) px-3 py-1.5 text-(--ok-accent) hover:bg-(--ok-fill)'

export function App() {
  const [capture, setCapture] = useState<Capture | null | undefined>(undefined)
  const [part, setPart] = useState(0)
  const [type, setType] = useState<ImageType>('image/png')
  const [resolution, setResolution] = useState(1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id')
    void (async () => setCapture(id ? ((await loadCapture(id)) ?? null) : null))()
  }, [])

  const [imageUrl, setImageUrl] = useState<string>()

  useEffect(() => {
    if (!capture) return
    const url = URL.createObjectURL(capture.parts[part])
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [capture, part])

  if (capture === undefined) return null
  if (capture === null) return <p className="p-8 text-(--ok-label-2)">{t('captureMissing')}</p>

  const split = capture.parts.length > 1
  const render = (forType: ImageType) => renderImage(capture.parts[part], forType, resolution)

  const download = async () => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(await render(type))
    link.download = fileName(new Date(capture.createdAt), type, split ? part + 1 : undefined)
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 10_000)
  }

  // 클립보드는 PNG만 받으므로 고른 형식과 상관없이 PNG로 복사
  const copy = async () => {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': render('image/png') })])
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const openInNewTab = async () => {
    window.open(URL.createObjectURL(await render(type)), '_blank')
  }

  return (
    <main className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="me-auto px-3 text-xl font-bold">{t('editorTitle')}</h1>
        <button type="button" className={secondaryButton} onClick={copy}>
          {copied ? t('copied') : t('copy')}
        </button>
        <button type="button" className={secondaryButton} onClick={openInNewTab}>
          {t('openInNewTab')}
        </button>
        <button type="button" className="rounded-lg bg-(--ok-accent) px-3 py-1.5 font-semibold text-(--ok-on-accent) hover:opacity-90" onClick={download}>
          {t('download')}
        </button>
      </header>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          {(split || capture.truncated) && (
            <div className="flex flex-wrap items-center gap-2 px-3 text-xs text-(--ok-label-2)">
              {capture.truncated && <p>{t('pageTruncated')}</p>}
              {split && <p>{t('pageSplit', capture.parts.length)}</p>}
              {split && (
                <div role="group" dir="ltr" className="flex gap-1">
                  {capture.parts.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-pressed={index === part}
                      aria-label={t('partLabel', index + 1)}
                      className="min-w-7 rounded-lg px-2 py-1 hover:bg-(--ok-fill) aria-pressed:bg-(--ok-cell) aria-pressed:text-(--ok-label)"
                      onClick={() => setPart(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <img src={imageUrl} alt={t('screenshot')} className="mx-auto max-w-full rounded-xl bg-(--ok-cell)" />
        </section>
        <aside className="shrink-0 lg:w-64">
          <h2 className="mb-1.5 px-3 text-xs text-(--ok-label-2)">{t('exportTitle')}</h2>
          <div className="overflow-hidden rounded-xl bg-(--ok-cell)">
            <Row label={t('format')}>
              <select className={selectClass} value={type} onChange={(event) => setType(event.target.value as ImageType)}>
                {TYPES.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </Row>
            <div className="ms-3 h-px bg-(--ok-fill)" />
            <Row label={t('resolution')}>
              <select className={selectClass} value={resolution} onChange={(event) => setResolution(Number(event.target.value))}>
                {RESOLUTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value === 1 ? t('original') : `${value * 100}%`}
                  </option>
                ))}
              </select>
            </Row>
          </div>
        </aside>
      </div>
    </main>
  )
}

const selectClass = 'bg-transparent text-end text-(--ok-label-2) outline-none'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2.5">
      <span className="flex-1">{label}</span>
      {children}
    </label>
  )
}

async function renderImage(source: Blob, type: ImageType, resolution: number): Promise<Blob> {
  if (type === 'image/png' && resolution === 1) return source
  const bitmap = await createImageBitmap(source)
  const canvas = new OffscreenCanvas(Math.max(1, Math.round(bitmap.width * resolution)), Math.max(1, Math.round(bitmap.height * resolution)))
  const context = canvas.getContext('2d')!
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.convertToBlob({ type, quality: 0.92 })
}
