import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react'
import { t } from '../../../i18n'
import { fileName, type ImageType } from '../shot'
import { loadCapture, type Capture } from '../store'
import { commit, initHistory, redo, undo, type History } from './editor/history'
import { UI_ICONS } from './editor/icons'
import { addCustomColor, loadCustomColors, saveCustomColors } from './editor/colors'
import { applyStyle, DEFAULT_STYLE, pasted, reorder, styleOf, type Order } from './editor/items'
import { loadItemLimit, MAX_ITEMS, saveItemLimit } from './editor/limit'
import { editorAction, IS_MAC, isHoldKey, keyLabel, toolKeyAction } from './editor/keys'
import { Parts } from './editor/Parts'
import { Properties } from './editor/Properties'
import { Settings } from './editor/Settings'
import { fitInside, Stage, visibleRect, type StageApi } from './editor/Stage'
import { Glyph, iconButton, Toolbar } from './editor/Toolbar'
import type { Doc, Item, Style, Tool } from './editor/types'
import { fitZoom, maxZoom, stepZoom } from './editor/view'
import { loadWork, saveWork, workSize, type Work, type WorkMode } from './editor/work'
import { WorkArea } from './editor/WorkArea'
import { WorkSelect } from './editor/WorkSelect'

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
  // null은 화면에 맞춤(원래 크기보다 키우지 않음), 창이나 작업 칸 크기가 바뀌면 다시 맞춤
  const [zoomSetting, setZoomSetting] = useState<number | null>(null)
  // 헤더 아래 영역 크기, 작업 칸과 떠 있는 도구 줄이 이 안에 있음
  const [area, setArea] = useState({ width: 0, height: 0 })
  const areaRef = useRef<HTMLDivElement>(null)
  const [work, setWork] = useState<Work>({ mode: 'fill', size: null })
  const workRef = useRef(work)
  workRef.current = work
  const stageApi = useRef<StageApi>(null)
  const clipboard = useRef<Item[]>([])
  // 직접 고른 색은 다음에 편집 화면을 열어도 쓰도록 확장 저장소에 보관
  const [customColors, setCustomColors] = useState<string[]>([])
  // 요소 개수 제한도 다음에 편집 화면을 열 때 그대로 쓰도록 확장 저장소에 보관
  const [limited, setLimited] = useState(true)
  const limitDialog = useRef<HTMLDialogElement>(null)
  // 떠 있는 속성 카드의 접힘, 속성 카드는 보여 줄 값이 없으면 사라져서 여기에 둠
  const [propertiesOpen, setPropertiesOpen] = useState(true)

  useEffect(() => {
    void loadCustomColors().then(setCustomColors)
    void loadItemLimit().then(setLimited)
    void loadWork().then(setWork)
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
    const element = areaRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setArea({ width: element.clientWidth, height: element.clientHeight }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [capture])

  const history = histories[part]
  const doc = history?.present ?? EMPTY_DOC
  const selected = doc.items.filter((item) => selectedIds.includes(item.id))
  const view = image && visibleRect(image, doc, tool)
  const limit = view ? maxZoom(view, devicePixelRatio) : 1
  const frame = work.mode === 'resize' ? workSize(work.size, area) : area
  // 스크롤 상자 안쪽 여백 p-4를 뺀 크기
  const box = { width: frame.width - 32, height: frame.height - 32 }
  const zoom = Math.min(limit, zoomSetting ?? (view && box.width > 0 && box.height > 0 ? fitZoom(view, box, devicePixelRatio) : 1))

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
    if (selected.length && !(tool !== 'select' && ('icon' in patch || 'curve' in patch || 'shape' in patch))) {
      const changed = selected.map((item) => applyStyle(item, patch))
      // 굵기나 크기를 키워 그림 밖으로 나간 요소는 다시 안으로
      const fitted = new Map((view ? fitInside(changed, view) : changed).map((item) => [item.id, item]))
      commitDoc({ ...doc, items: doc.items.map((item) => fitted.get(item.id) ?? item) })
    }
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

  // 붙일 때마다 앞서 붙인 자리에서 비껴 놓으려고 그림 안으로 맞춘 요소를 다음 복사 원본으로 둠
  const paste = () => {
    if (!clipboard.current.length) return
    if (limited && doc.items.length + clipboard.current.length > MAX_ITEMS) return showLimit()
    const moved = clipboard.current.map(pasted)
    const items = image ? fitInside(moved, visibleRect(image, doc, 'select')) : moved
    clipboard.current = items
    commitDoc({ ...doc, items: [...doc.items, ...items] })
    setTool('select')
    setSelectedIds(items.map((item) => item.id))
  }

  const changeLimit = (next: boolean) => {
    setLimited(next)
    void saveItemLimit(next)
  }

  const zoomBy = (direction: 1 | -1 | 0) => setZoomSetting(direction === 0 ? null : stepZoom(zoom, direction, limit))

  const changeMode = (mode: WorkMode) => {
    const next = { ...workRef.current, mode }
    setWork(next)
    void saveWork(next)
    setZoomSetting(null)
  }

  // 끄는 동안은 저장하지 않고 끝에 한 번 저장
  const resizeWork = (size: { width: number; height: number }) => {
    // 방향키는 onSize 바로 뒤에 onSizeEnd가 와서 다시 그리기 전에 저장할 값을 ref에 먼저 넣음
    const next = { ...workRef.current, size }
    workRef.current = next
    setWork(next)
    setZoomSetting(null)
  }

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
      // 한도 알림이나 메뉴가 떠 있는 동안은 Esc로 닫는 것 말고 편집 키를 받지 않음
      if (limitDialog.current!.open || document.querySelector(':popover-open')) return
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
  if (capture === null)
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <div className="w-full max-w-xs rounded-xl bg-(--ok-cell) px-6 py-5 text-center">
          <Glyph body={UI_ICONS.imageOff} className="mx-auto size-9 text-(--ok-label-3)" />
          <h1 className="mt-2 mb-1 text-base font-bold">{t('captureMissing')}</h1>
          <p className="text-xs whitespace-pre-line text-(--ok-label-2)">{t('captureMissingHint')}</p>
          <button type="button" className="mt-3.5 rounded-lg bg-(--ok-accent) px-3 py-1.5 font-semibold text-(--ok-on-accent) hover:opacity-90" onClick={() => window.close()}>
            {t('closeTab')}
          </button>
        </div>
      </main>
    )

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
  const properties: Omit<ComponentProps<typeof Properties>, 'open' | 'onToggle'> = {
    kind: tool !== 'select' ? tool : selected.length && selected.every((item) => item.kind === selected[0]!.kind) ? selected[0]!.kind : 'select',
    style: tool === 'select' && selected.length ? styleOf(selected[0]!, style) : style,
    onStyle: changeStyle,
    customColors,
    onCustomColor: pickCustomColor,
    onOrder: tool === 'select' && selected.length ? changeOrder : undefined,
    onDelete: selected.length ? removeSelected : undefined,
    onResetCrop: doc.crop ? () => commitDoc({ ...doc, crop: null }) : undefined,
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center gap-2 p-4">
        <h1 className="px-3 text-xl font-bold">{t('editorTitle')}</h1>
        <div className="me-auto flex gap-0.5">
          <button type="button" aria-label={t('undo')} title={`${t('undo')} ${keyLabel('undo')}`} className={iconButton} disabled={!history?.past.length} onClick={actions.undo}>
            <Glyph body={UI_ICONS.undo} className="size-5 rtl:-scale-x-100" />
          </button>
          <button type="button" aria-label={t('redo')} title={`${t('redo')} ${keyLabel('redo')}`} className={iconButton} disabled={!history?.future.length} onClick={actions.redo}>
            <Glyph body={UI_ICONS.redo} className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
        <WorkSelect value={work.mode} onChange={changeMode} />
        <button type="button" className={secondaryButton} onClick={copy}>
          {copied ? t('copied') : t('copy')}
        </button>
        <button type="button" className={secondaryButton} onClick={openInNewTab}>
          {t('openInNewTab')}
        </button>
        <button type="button" className="rounded-lg bg-(--ok-accent) px-3 py-1.5 font-semibold text-(--ok-on-accent) hover:opacity-90" onClick={download}>
          {t('download')}
        </button>
        <Settings type={type} onType={setType} resolution={resolution} onResolution={setResolution} limited={limited} onLimit={changeLimit} />
      </header>
      <div ref={areaRef} className="relative min-h-0 flex-1">
        <WorkArea mode={work.mode} size={frame} area={area} onSize={resizeWork} onSizeEnd={() => void saveWork(workRef.current)}>
          <div
            dir="ltr"
            data-ready={image ? '' : undefined}
            data-zoom={zoom}
            data-items={doc.items.length}
            className={`ok-scroll flex size-full overflow-auto bg-(--ok-fill) p-4 ${work.mode === 'resize' ? 'rounded-xl' : ''}`}
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
        </WorkArea>
        {split && <Parts count={capture.parts.length} part={part} onPart={setPart} />}
        <Toolbar tool={tool} onTool={changeTool} zoom={zoom} onZoom={zoomBy} area={area}>
          <Properties {...properties} open={propertiesOpen} onToggle={() => setPropertiesOpen((open) => !open)} />
        </Toolbar>
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

async function renderImage(source: HTMLCanvasElement, type: ImageType, resolution: number): Promise<Blob> {
  const canvas = new OffscreenCanvas(Math.max(1, Math.round(source.width * resolution)), Math.max(1, Math.round(source.height * resolution)))
  const context = canvas.getContext('2d')!
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.convertToBlob({ type, quality: 0.92 })
}
