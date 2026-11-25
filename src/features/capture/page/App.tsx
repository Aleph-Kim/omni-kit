import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { t } from '../../../i18n'
import { fileName, type ImageType } from '../shot'
import { loadCapture, type Capture } from '../store'
import { commit, initHistory, redo, undo, type History } from './editor/history'
import { UI_ICONS } from './editor/icons'
import { addCustomColor, loadCustomColors, saveCustomColors } from './editor/colors'
import { applyStyle, DEFAULT_STYLE, pasted, reorder, styleOf, type Order } from './editor/items'
import { loadItemLimit, MAX_ITEMS, saveItemLimit } from './editor/limit'
import { editorAction, holdKeyLabel, IS_MAC, isHoldKey, keyLabel, toolKeyAction } from './editor/keys'
import { Properties } from './editor/Properties'
import { Stage, visibleRect, type StageApi } from './editor/Stage'
import { Glyph, iconButton, Toolbar } from './editor/Toolbar'
import type { Doc, Item, Style, Tool } from './editor/types'
import { fitZoom, maxZoom, stepZoom } from './editor/view'

const TYPES: { type: ImageType; label: string }[] = [
  { type: 'image/png', label: 'PNG' },
  { type: 'image/jpeg', label: 'JPEG' },
  { type: 'image/webp', label: 'WebP' },
]
const RESOLUTIONS = [1, 0.5, 0.25]

const secondaryButton = 'rounded-lg bg-(--ok-cell) px-3 py-1.5 text-(--ok-accent) hover:bg-(--ok-fill)'

const EMPTY_DOC: Doc = { items: [], crop: null }

export function App() {
  const [capture, setCapture] = useState<Capture | null | undefined>(undefined)
  const [part, setPart] = useState(0)
  const [type, setType] = useState<ImageType>('image/png')
  const [resolution, setResolution] = useState(1)
  const [copied, setCopied] = useState(false)
  const [image, setImage] = useState<HTMLImageElement>()
  // 여러 장으로 나뉜 캡처는 장마다 꾸미기와 되돌리기 기록을 따로 보관
  const [histories, setHistories] = useState<History<Doc>[]>([])
  const [tool, setTool] = useState<Tool>('select')
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Cmd(그 외 Ctrl)를 누르고 있는 동안은 어떤 도구든 잠깐 선택 도구처럼 요소를 고르고 옮김
  const [holding, setHolding] = useState(false)
  // null은 화면에 맞춤, 창 크기가 바뀌면 다시 맞춤
  const [zoomSetting, setZoomSetting] = useState<number | null>(null)
  const [box, setBox] = useState({ width: 0, height: 0 })
  const boxRef = useRef<HTMLDivElement>(null)
  const stageApi = useRef<StageApi>(null)
  const clipboard = useRef<Item[]>([])
  // 직접 고른 색은 다음에 편집 화면을 열어도 쓰도록 확장 저장소에 보관
  const [customColors, setCustomColors] = useState<string[]>([])
  // 요소 개수 제한도 다음에 편집 화면을 열 때 그대로 쓰도록 확장 저장소에 보관
  const [limited, setLimited] = useState(true)
  const [confirmingOff, setConfirmingOff] = useState(false)
  const limitDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    void loadCustomColors().then(setCustomColors)
    void loadItemLimit().then(setLimited)
  }, [])

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id')
    void (async () => {
      const loaded = id ? ((await loadCapture(id)) ?? null) : null
      setHistories(loaded ? loaded.parts.map(() => initHistory(EMPTY_DOC)) : [])
      setCapture(loaded)
    })()
  }, [])

  useEffect(() => {
    if (!capture) return
    const url = URL.createObjectURL(capture.parts[part])
    const element = new Image()
    element.onload = () => setImage(element)
    element.src = url
    setImage(undefined)
    setSelectedIds([])
    return () => URL.revokeObjectURL(url)
  }, [capture, part])

  useLayoutEffect(() => {
    const element = boxRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setBox({ width: element.clientWidth - 32, height: element.clientHeight - 32 }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [capture])

  const history = histories[part]
  const doc = history?.present ?? EMPTY_DOC
  const selected = doc.items.filter((item) => selectedIds.includes(item.id))
  const view = image && visibleRect(image, doc, tool)
  const limit = view ? maxZoom(view, devicePixelRatio) : 1
  const zoom = Math.min(limit, zoomSetting ?? (view && box.width > 0 ? fitZoom(view, box) : 1))

  const full = limited && doc.items.length >= MAX_ITEMS
  const showLimit = () => limitDialog.current!.showModal()

  const setHistory = (change: (history: History<Doc>) => History<Doc>) => setHistories((all) => all.map((each, index) => (index === part ? change(each) : each)))
  const commitDoc = (next: Doc) => setHistory((each) => commit(each, next))

  const select = (ids: string[]) => {
    setSelectedIds(ids)
    const item = ids.length === 1 && doc.items.find((each) => each.id === ids[0])
    if (item) setStyle((current) => styleOf(item, current))
  }

  const changeStyle = (patch: Partial<Style>) => {
    setStyle((current) => ({ ...current, ...patch }))
    // 그리는 도구에서 아이콘 종류, 화살표 모양, 도형 모양을 바꾸면 방금 그린 요소는 두고 다음에 그릴 요소만 바꿈
    if (selected.length && !(tool !== 'select' && ('icon' in patch || 'curve' in patch || 'shape' in patch)))
      commitDoc({ ...doc, items: doc.items.map((item) => (selected.includes(item) ? applyStyle(item, patch) : item)) })
  }

  const pickCustomColor = (field: 'color' | 'fill', color: string) => {
    changeStyle({ [field]: color.toLowerCase() })
    const next = addCustomColor(customColors, color)
    setCustomColors(next)
    void saveCustomColors(next)
  }

  const changeOrder = (order: Order) => commitDoc({ ...doc, items: reorder(doc.items, selectedIds, order) })

  const removeSelected = () => {
    commitDoc({ ...doc, items: doc.items.filter((item) => !selected.includes(item)) })
    setSelectedIds([])
  }

  const changeTool = (next: Tool) => {
    setTool(next)
    if (next !== 'select') setSelectedIds([])
  }

  // 붙일 때마다 앞서 붙인 자리에서 비껴 놓으려고 붙인 요소를 다음 복사 원본으로 둠
  const paste = () => {
    if (!clipboard.current.length) return
    if (limited && doc.items.length + clipboard.current.length > MAX_ITEMS) return showLimit()
    const items = clipboard.current.map(pasted)
    clipboard.current = items
    commitDoc({ ...doc, items: [...doc.items, ...items] })
    setTool('select')
    setSelectedIds(items.map((item) => item.id))
  }

  const changeLimit = (next: boolean) => {
    setLimited(next)
    setConfirmingOff(false)
    void saveItemLimit(next)
  }

  const zoomBy = (direction: 1 | -1 | 0) => setZoomSetting(direction === 0 ? null : stepZoom(zoom, direction, limit))

  const actions = {
    undo: () => setHistory(undo),
    redo: () => setHistory(redo),
    delete: selected.length ? removeSelected : undefined,
    escape: () => setSelectedIds([]),
    copy: selected.length ? () => (clipboard.current = selected) : undefined,
    paste,
    tool: changeTool,
    zoom: zoomBy,
  }
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // 한도 알림이 떠 있는 동안은 Esc로 닫는 것 말고 편집 키를 받지 않음
      if (limitDialog.current!.open) return
      const typing = event.target instanceof Element && event.target.matches('input:not([type=range]), textarea, select, [contenteditable]')
      const action = editorAction(event, IS_MAC, typing)
      const run = action && actionsRef.current[action]
      if (run) {
        event.preventDefault()
        return run()
      }
      if (isHoldKey(event, IS_MAC) && !typing) return setHolding(true)
      const shortcut = toolKeyAction(event, typing)
      if (!shortcut) return
      event.preventDefault()
      if (shortcut === 'zoomIn' || shortcut === 'zoomOut' || shortcut === 'zoomFit') actionsRef.current.zoom(shortcut === 'zoomIn' ? 1 : shortcut === 'zoomOut' ? -1 : 0)
      else actionsRef.current.tool(shortcut)
    }
    const onKeyUp = (event: KeyboardEvent) => isHoldKey(event, IS_MAC) && setHolding(false)
    // 키를 누른 채 다른 창으로 가면 떼는 이벤트가 오지 않음
    const onBlur = () => setHolding(false)
    addEventListener('keydown', onKey)
    addEventListener('keyup', onKeyUp)
    addEventListener('blur', onBlur)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('keyup', onKeyUp)
      removeEventListener('blur', onBlur)
    }
  }, [])

  if (capture === undefined) return null
  if (capture === null) return <p className="p-8 text-(--ok-label-2)">{t('captureMissing')}</p>

  const split = capture.parts.length > 1
  const render = (forType: ImageType) => renderImage(stageApi.current!.exportCanvas(), forType, resolution)

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
    <main className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4 lg:h-screen">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="px-3 text-xl font-bold">{t('editorTitle')}</h1>
        <div className="me-auto flex gap-0.5">
          <button type="button" aria-label={t('undo')} title={`${t('undo')} ${keyLabel('undo')}`} className={iconButton} disabled={!history?.past.length} onClick={actions.undo}>
            <Glyph body={UI_ICONS.undo} className="size-5 rtl:-scale-x-100" />
          </button>
          <button type="button" aria-label={t('redo')} title={`${t('redo')} ${keyLabel('redo')}`} className={iconButton} disabled={!history?.future.length} onClick={actions.redo}>
            <Glyph body={UI_ICONS.redo} className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
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
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <Toolbar tool={tool} onTool={changeTool} zoom={zoom} onZoom={zoomBy} />
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <p className="px-3 text-xs text-(--ok-label-2)">{t('holdToMove', holdKeyLabel())}</p>
          {split && (
            <div className="flex flex-wrap items-center gap-2 px-3 text-xs text-(--ok-label-2)">
              <p>{t('pageSplit', capture.parts.length)}</p>
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
            </div>
          )}
          <div
            ref={boxRef}
            dir="ltr"
            data-ready={image ? '' : undefined}
            data-zoom={zoom}
            data-items={doc.items.length}
            className="ok-scroll flex h-[70vh] min-h-0 overflow-auto rounded-xl bg-(--ok-fill) p-4 lg:h-auto lg:flex-1"
          >
            {image && (
              <div className="m-auto shadow-sm">
                <Stage
                  ref={stageApi}
                  image={image}
                  doc={doc}
                  tool={holding ? 'select' : tool}
                  style={style}
                  zoom={zoom}
                  selectedIds={selectedIds}
                  onSelect={select}
                  onCommit={commitDoc}
                  onCropDone={() => changeTool('select')}
                  full={full}
                  onFull={showLimit}
                />
              </div>
            )}
          </div>
        </section>
        <aside className="ok-scroll shrink-0 overflow-y-auto lg:w-64">
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
          <div className="mt-4 overflow-hidden rounded-xl bg-(--ok-cell)">
            <Row label={t('itemLimit', MAX_ITEMS)}>
              <input
                type="checkbox"
                className="size-4 cursor-pointer accent-(--ok-accent)"
                checked={limited}
                onChange={(event) => (event.target.checked ? changeLimit(true) : setConfirmingOff(true))}
              />
            </Row>
            {confirmingOff && (
              <div className="px-3 pb-3">
                <p className="text-xs text-(--ok-label-2)">{t('itemLimitWarning')}</p>
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" className={secondaryButton} onClick={() => setConfirmingOff(false)}>
                    {t('cancel')}
                  </button>
                  <button type="button" className="rounded-lg px-3 py-1.5 text-(--ok-destructive) hover:bg-(--ok-fill)" onClick={() => changeLimit(false)}>
                    {t('itemLimitTurnOff')}
                  </button>
                </div>
              </div>
            )}
          </div>
          <Properties
            kind={tool !== 'select' ? tool : selected.length && selected.every((item) => item.kind === selected[0]!.kind) ? selected[0]!.kind : 'select'}
            style={tool === 'select' && selected.length ? styleOf(selected[0]!, style) : style}
            onStyle={changeStyle}
            customColors={customColors}
            onCustomColor={pickCustomColor}
            onOrder={tool === 'select' && selected.length ? changeOrder : undefined}
            onDelete={selected.length ? removeSelected : undefined}
            onResetCrop={doc.crop ? () => commitDoc({ ...doc, crop: null }) : undefined}
          />
        </aside>
      </div>
      <dialog ref={limitDialog} className="m-auto w-fit max-w-[min(36rem,calc(100vw-2rem))] rounded-xl bg-(--ok-cell) p-4 text-(--ok-label) backdrop:bg-(--ok-backdrop)">
        <p className="whitespace-pre-line">{t('itemLimitReached', MAX_ITEMS)}</p>
        <form method="dialog" className="mt-4 flex justify-end">
          <button type="submit" autoFocus className="rounded-lg bg-(--ok-accent) px-3 py-1.5 font-semibold text-(--ok-on-accent) hover:opacity-90">
            {t('ok')}
          </button>
        </form>
      </dialog>
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

async function renderImage(source: HTMLCanvasElement, type: ImageType, resolution: number): Promise<Blob> {
  const canvas = new OffscreenCanvas(Math.max(1, Math.round(source.width * resolution)), Math.max(1, Math.round(source.height * resolution)))
  const context = canvas.getContext('2d')!
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.convertToBlob({ type, quality: 0.92 })
}
