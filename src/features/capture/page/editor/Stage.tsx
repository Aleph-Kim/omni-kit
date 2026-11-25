import Konva from 'konva'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Arrow, Circle, Group, Image, Layer, Line, Rect, Shape, Stage as KonvaStage, Text, Transformer } from 'react-konva'
import { t } from '../../../../i18n'
import type { Rect as Box } from '../../shot'
import { clampPoint, fitItems, localBox, overflow, shiftInside, union } from './bounds'
import { STAMP_ICONS } from './icons'
import { isTiny, placeItem, resize, smoothCurve, startItem } from './items'
import { drawShape } from './shapes'
import { FONT_FAMILY, newId, type Doc, type Item, type Style, type Tool } from './types'
import { dragRect, exportArea } from './view'

export type StageApi = { exportCanvas: () => HTMLCanvasElement }

type Props = {
  ref: Ref<StageApi>
  image: HTMLImageElement
  doc: Doc
  tool: Tool
  style: Style
  zoom: number
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  onCommit: (doc: Doc) => void
  onCropDone: () => void
  /** 요소 개수 한도에 닿아 새 요소를 만들지 않음 */
  full: boolean
  onFull: () => void
}

/** 화면에 보이는 그림 영역, 자르기 도구를 쓰는 중에는 자른 바깥도 보여 줌 */
export const visibleRect = (image: HTMLImageElement, doc: Doc, tool: Tool): Box =>
  tool !== 'crop' && doc.crop ? doc.crop : { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }

const LINE_HEIGHT = 1.2

const textProps = (item: Extract<Item, { kind: 'text' }>) => ({ text: item.text, fontFamily: FONT_FAMILY[item.font], fontSize: item.fontSize, lineHeight: LINE_HEIGHT })
const arrowProps = (item: Extract<Item, { kind: 'arrow' }>) => ({
  points: item.points,
  strokeWidth: item.thickness,
  tension: item.curve ? 0.5 : 0,
  pointerLength: item.thickness * 3 + 6,
  pointerWidth: item.thickness * 3 + 6,
})
const penProps = (item: Extract<Item, { kind: 'pen' }>) => ({ points: item.points, strokeWidth: item.thickness, tension: 0.4 })

// 글자 폭과 곡선이 부푼 자리는 konva가 그리는 것과 같게 재려고 같은 값의 도형으로 잼 (stroke가 있어야 선 굵기가 상자에 들어감)
function measure(item: Item): Box {
  const local = { skipTransform: true }
  switch (item.kind) {
    case 'text':
      return new Konva.Text(textProps(item)).getClientRect(local)
    case 'arrow':
      return new Konva.Arrow({ ...arrowProps(item), stroke: 'black' }).getClientRect(local)
    case 'pen':
      return new Konva.Line({ ...penProps(item), stroke: 'black' }).getClientRect(local)
    default:
      return localBox(item)
  }
}

/** 요소들을 묶음 전체가 영역(그림 좌표) 안에 들어오게 같이 옮김, 회전한 요소는 돌린 모양을 감싼 상자 기준 */
export const fitInside = (items: Item[], bounds: Box): Item[] => fitItems(items, bounds, measure)

type Placement = { x: number; y: number; scaleX: number; scaleY: number; rotation: number }
const placement = (node: Konva.Node): Placement => ({ x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() })

export function Stage({ ref, image, doc, tool, style, zoom, selectedIds, onSelect, onCommit, onCropDone, full, onFull }: Props) {
  const stageRef = useRef<Konva.Stage>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [draft, setDraft] = useState<Item | null>(null)
  const [cropDraft, setCropDraft] = useState<Box | null>(null)
  const [editing, setEditing] = useState<Extract<Item, { kind: 'text' }> | null>(null)
  const [marquee, setMarquee] = useState<Box | null>(null)
  const [hover, setHover] = useState<'item' | 'box' | null>(null)
  // 여러 요소를 같이 옮기거나 늘리면 요소마다 끝 이벤트가 와서, 같은 순간의 것을 한 번만 기록하려고 최신 문서를 참조
  const docRef = useRef(doc)
  docRef.current = doc
  const pendingSync = useRef<Set<string> | null>(null)
  // 여러 개를 같이 끌면 konva가 요소마다 따로 끌기 제한을 불러서, 묶음 상자에서 각 요소까지의 거리를 끌기 시작 때 한 번 재 둠
  const dragGroup = useRef(new Map<string, { dx: number; dy: number; width: number; height: number }>())
  // 크기 조절, 회전 중 마지막으로 영역 밖으로 더 나가지 않은 상태
  const lastFit = useRef<{ nodes: [Konva.Node, Placement][]; rotation: number; overflow: number } | null>(null)
  const size = { width: image.naturalWidth, height: image.naturalHeight }
  const view = visibleRect(image, doc, tool)
  const selected = tool === 'select' ? doc.items.filter((item) => selectedIds.includes(item.id)) : []
  // konva 끌기, 크기 조절은 절대 좌표(배율 곱한 화면 좌표)라 보이는 영역도 같은 좌표로
  const area = { x: 0, y: 0, width: view.width * zoom, height: view.height * zoom }

  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      const transformer = transformerRef.current!
      transformer.visible(false)
      const canvas = layerRef.current!.toCanvas(exportArea(size, doc.crop, view, zoom))
      transformer.visible(true)
      return canvas
    },
  }))

  useEffect(() => {
    const nodes = selected.map((item) => layerRef.current!.findOne(`#${item.id}`)).filter((node): node is Konva.Node => !!node)
    transformerRef.current!.nodes(nodes)
  }, [selected.map((item) => item.id).join(), doc])

  const pointer = () => layerRef.current!.getRelativePointerPosition()!

  // 그림 밖에서 손을 떼도 끝나도록 끄는 동안은 창 전체의 움직임을 받음
  const track = (onMove: (at: { x: number; y: number }) => void, onEnd: () => void) => {
    const move = (event: PointerEvent) => {
      stageRef.current!.setPointersPositions(event)
      onMove(pointer())
    }
    const up = () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      onEnd()
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  }

  const onPointerDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
    // konva가 누르기의 기본 동작을 막아 초점이 주소창이나 선택 상자에 남고 단축키가 그쪽으로 가는 문제 방지
    wrapperRef.current!.focus({ preventScroll: true })
    dragGroup.current.clear()
    if (event.evt.button !== 0 || editing) return
    let start = pointer()
    if (tool === 'select') {
      // 요소나 크기, 회전 손잡이를 누른 것은 빈 곳이 아님
      if (event.target.findAncestor('.item', true) || event.target.findAncestor('Transformer')) return
      // 빈 곳에서 끌면 끈 영역에 닿은 요소를 모두 고르고, 끌지 않고 누르기만 하면 선택 해제
      let rect: Box = { ...start, width: 0, height: 0 }
      setMarquee(rect)
      onSelect([])
      track(
        (at) => setMarquee((rect = dragRect(start, at, { width: Infinity, height: Infinity }))),
        () => {
          setMarquee(null)
          if (rect.width < 3 && rect.height < 3) return
          const layer = layerRef.current!
          onSelect(
            layer
              .find('.item')
              .filter((node) => Konva.Util.haveIntersection(rect, node.getClientRect({ relativeTo: layer })))
              .map((node) => node.id()),
          )
        },
      )
      return
    }
    if (tool === 'text') {
      // 뒤따르는 mousedown이 초점을 옮겨 막 연 글자 칸이 바로 닫히는 문제 방지
      event.evt.preventDefault()
      const hit = event.target.findAncestor('.item', true)
      const existing = doc.items.find((item) => item.id === hit?.id())
      if (existing?.kind === 'text') return setEditing(existing)
      if (full) return onFull()
      setEditing({ id: newId(), kind: 'text', x: start.x, y: start.y - (style.fontSize * LINE_HEIGHT) / 2, rotation: 0, scaleX: 1, scaleY: 1, text: '', color: style.color, font: style.font, fontSize: style.fontSize })
      return
    }
    if (tool === 'icon') {
      if (full) return onFull()
      const item = fitInside([placeItem(start, style, doc)], view)[0]!
      onCommit({ ...doc, items: [...doc.items, item] })
      onSelect([item.id])
      return
    }
    if (tool === 'crop') {
      let rect: Box = { ...start, width: 0, height: 0 }
      track(
        (at) => setCropDraft((rect = dragRect(start, at, size))),
        () => {
          setCropDraft(null)
          if (rect.width >= 3 && rect.height >= 3) {
            onCommit({ ...doc, crop: rect })
            onCropDone()
          }
        },
      )
      return
    }
    // 선 굵기와 화살촉이 그림 밖으로 나가지 않게 그 폭만큼 안쪽까지
    const margin = tool === 'arrow' ? style.thickness * 2 + 3 : tool === 'pen' || tool === 'shape' ? style.thickness / 2 : 0
    start = clampPoint(start, view, margin)
    let item = startItem(tool, start, style)
    if (!item) return
    if (full) return onFull()
    setDraft(item)
    track(
      (at) => setDraft((item = resize(item!, start, clampPoint(at, view, margin)))),
      () => {
        setDraft(null)
        if (isTiny(item!)) return
        if (item!.kind === 'arrow' && item!.curve) item = { ...item!, points: smoothCurve(item!.points, zoom) }
        // 곡선은 점 사이가 부풀어 끝점을 제한해도 밖으로 나갈 수 있음
        item = fitInside([item!], view)[0]!
        onCommit({ ...doc, items: [...doc.items, item!] })
        onSelect([item!.id])
      },
    )
  }

  const update = (id: string, change: Partial<Item>) =>
    onCommit({ ...doc, items: doc.items.map((item) => (item.id === id ? ({ ...item, ...change } as Item) : item)) })

  /** 옮기거나 늘린 요소들의 지금 자리와 크기를 한 번에 기록 (같은 순간에 여러 번 불려도 한 번만) */
  const syncNodes = (ids: string[]) => {
    if (pendingSync.current) return ids.forEach((id) => pendingSync.current!.add(id))
    pendingSync.current = new Set(ids)
    queueMicrotask(() => {
      const synced = pendingSync.current!
      pendingSync.current = null
      const layer = layerRef.current!
      const current = docRef.current
      // 상자 안 빈 곳을 끌면 첫 움직임은 끌기 제한 없이 옮겨져서 끝난 자리를 한 번 더 맞춤
      const fitted = new Map(fitInside(current.items.filter((item) => synced.has(item.id)).map((item) => fromNode(item, layer.findOne(`#${item.id}`)!)), view).map((item) => [item.id, item]))
      // 기록한 값이 끌기 전 값과 같으면 react-konva가 자리를 다시 넣지 않아서 직접 옮김
      fitted.forEach((item) => layer.findOne(`#${item.id}`)!.position({ x: item.x, y: item.y }))
      onCommit({ ...current, items: current.items.map((item) => fitted.get(item.id) ?? item) })
    })
  }

  const finishText = (text: string) => {
    const item = editing!
    setEditing(null)
    const exists = doc.items.some((other) => other.id === item.id)
    if (!text.trim()) {
      if (exists) onCommit({ ...doc, items: doc.items.filter((other) => other.id !== item.id) })
      return
    }
    const fitted = fitInside([{ ...(doc.items.find((other) => other.id === item.id) ?? item), text } as Item], view)[0]!
    if (exists) update(item.id, fitted)
    else onCommit({ ...doc, items: [...doc.items, fitted] })
    onSelect([item.id])
  }

  const nodesOverflow = (nodes: Konva.Node[]) => overflow(union(nodes.map((node) => node.getClientRect())), area)

  const dragBound = (node: Konva.Node, pos: { x: number; y: number }) => {
    const group = dragGroup.current
    if (!group.has(node.id())) {
      const nodes = transformerRef.current!.nodes()
      const together = nodes.includes(node) ? nodes : [node]
      const box = union(together.map((other) => other.getClientRect()))
      for (const other of together) {
        const at = other.absolutePosition()
        group.set(other.id(), { dx: box.x - at.x, dy: box.y - at.y, width: box.width, height: box.height })
      }
    }
    const { dx, dy, width, height } = group.get(node.id())!
    const shift = shiftInside({ x: pos.x + dx, y: pos.y + dy, width, height }, area)
    return { x: pos.x + shift.dx, y: pos.y + shift.dy }
  }

  const items = draft ? [...doc.items, draft] : doc.items

  return (
    <div ref={wrapperRef} tabIndex={-1} className="relative outline-none" style={{ cursor: tool !== 'select' ? 'crosshair' : hover === 'box' ? 'move' : hover === 'item' ? 'pointer' : 'default' }}>
      <KonvaStage ref={stageRef} width={view.width * zoom} height={view.height * zoom} scaleX={zoom} scaleY={zoom}
        onPointerDown={onPointerDown}
        // 지운 요소 위에서는 떠나는 이벤트가 오지 않아서 움직일 때마다 아래 요소로 판별
        onPointerMove={(event) => setHover(event.target.hasName('back') ? 'box' : event.target.findAncestor('.item', true) ? 'item' : null)}
        onPointerLeave={() => setHover(null)}
      >
        <Layer ref={layerRef} offsetX={view.x} offsetY={view.y}>
          <Image image={image} />
          {items.map((item) => (
            <Group
              key={item.id}
              id={item.id}
              name="item"
              x={item.x}
              y={item.y}
              rotation={item.rotation}
              scaleX={item.scaleX}
              scaleY={item.scaleY}
              visible={item.id !== editing?.id}
              draggable={tool === 'select'}
              dragBoundFunc={function (this: Konva.Node, pos) {
                return dragBound(this, pos)
              }}
              onPointerDown={() => tool === 'select' && !selectedIds.includes(item.id) && onSelect([item.id])}
              onDblClick={() => item.kind === 'text' && setEditing(item)}
              onDragEnd={() => {
                dragGroup.current.clear()
                syncNodes(selectedIds.includes(item.id) ? selectedIds : [item.id])
              }}
            >
              <ItemShape item={item} image={image} />
            </Group>
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={!selected.some((item) => item.kind === 'mosaic' || item.kind === 'blur')}
            onTransformStart={() => {
              const transformer = transformerRef.current!
              lastFit.current = { nodes: transformer.nodes().map((node) => [node, placement(node)]), rotation: transformer.rotation(), overflow: nodesOverflow(transformer.nodes()) }
            }}
            // 영역 밖으로 더 나가면 직전 상태로 되돌림 (자른 뒤 이미 밖에 있는 요소도 줄이거나 안으로 돌릴 수는 있게 늘어날 때만 막음)
            onTransform={() => {
              const transformer = transformerRef.current!
              const last = lastFit.current!
              const now = nodesOverflow(transformer.nodes())
              if (now <= last.overflow + 0.5) {
                lastFit.current = { nodes: transformer.nodes().map((node) => [node, placement(node)]), rotation: transformer.rotation(), overflow: Math.min(last.overflow, now) }
                return
              }
              last.nodes.forEach(([node, at]) => node.setAttrs(at))
              transformer.rotation(last.rotation)
            }}
            onTransformEnd={() => syncNodes(selectedIds)}
            // 고른 요소들을 감싼 상자 안 빈 곳을 끌어도 같이 옮김
            shouldOverdrawWholeArea
            onDragEnd={() => {
              dragGroup.current.clear()
              syncNodes(selectedIds)
            }}
            // 상자가 요소를 덮어서 글자 하나만 고른 경우 상자를 두 번 눌러도 글자 고치기
            onDblClick={() => selected.length === 1 && selected[0]!.kind === 'text' && setEditing(selected[0]!)}
            ignoreStroke
            flipEnabled={false}
            boundBoxFunc={(old, next) => (Math.abs(next.width) < 5 || Math.abs(next.height) < 5 ? old : next)}
          />
        </Layer>
        <Layer listening={false} offsetX={view.x} offsetY={view.y}>
          {tool === 'crop' && <CropShade size={size} crop={cropDraft ?? doc.crop} />}
          {/* 흰 바탕처럼 효과가 티 나지 않는 곳에서도 끄는 영역이 보이게 화면에만 그리는 테두리 */}
          {(draft?.kind === 'mosaic' || draft?.kind === 'blur') && <MaskOutline item={draft} />}
          {marquee && <Rect {...marquee} fill="rgba(0,122,255,0.1)" stroke="#007aff" strokeWidth={1} strokeScaleEnabled={false} />}
        </Layer>
      </KonvaStage>
      {editing && <TextInput item={editing} view={view} zoom={zoom} onDone={finishText} />}
    </div>
  )
}

// 도형, 가리기는 늘린 비율을 크기에 반영해 선 굵기가 같이 늘지 않게 함
function fromNode(item: Item, node: Konva.Node): Item {
  const next = { ...item, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() } as Item
  if ('width' in next && 'width' in item) Object.assign(next, { width: item.width * node.scaleX(), height: item.height * node.scaleY(), scaleX: 1, scaleY: 1 })
  // 아이콘, 번호는 늘린 비율을 크기에 반영해 속성 카드의 크기 막대와 맞춤 (모서리 손잡이는 가로세로 비율 유지)
  if ('size' in next && 'size' in item) Object.assign(next, { size: item.size * node.scaleX(), scaleX: 1, scaleY: node.scaleY() / node.scaleX() })
  node.scale({ x: next.scaleX, y: next.scaleY })
  return next
}

function ItemShape({ item, image }: { item: Item; image: HTMLImageElement }) {
  switch (item.kind) {
    case 'text':
      return <Text {...textProps(item)} fill={item.color} />
    case 'arrow':
      return (
        <Arrow
          {...arrowProps(item)}
          stroke={item.color}
          fill={item.color}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={Math.max(item.thickness, 16)}
        />
      )
    case 'pen':
      return <Line {...penProps(item)} stroke={item.color} lineCap="round" lineJoin="round" hitStrokeWidth={Math.max(item.thickness, 16)} />
    case 'shape':
      // 채우기가 없어도 안쪽을 눌러 고를 수 있게 투명하게 채움
      return (
        <Shape
          width={item.width}
          height={item.height}
          stroke={item.color}
          strokeWidth={item.thickness}
          fill={item.fill ?? 'rgba(0,0,0,0)'}
          lineJoin="round"
          sceneFunc={(context, shape) => {
            context.beginPath()
            drawShape(context, item.shape, item.width, item.height)
            context.fillStrokeShape(shape)
          }}
        />
      )
    case 'mosaic':
    case 'blur':
      return <Mask item={item} image={image} />
    case 'icon':
      return <Icon item={item} />
    case 'number':
      return (
        <>
          <Circle x={item.size / 2} y={item.size / 2} radius={item.size / 2} fill={item.color} />
          <Text
            text={String(item.value)}
            width={item.size}
            height={item.size}
            align="center"
            verticalAlign="middle"
            fontStyle="bold"
            fontFamily={FONT_FAMILY.system}
            fontSize={item.size * 0.55}
            fill={item.color === '#ffffff' ? '#000000' : '#ffffff'}
          />
        </>
      )
  }
}

// 가리기는 원본 그림의 그 부분을 흐리게 한 것, 흐림 정도는 원본 픽셀 기준
function Mask({ item, image }: { item: Extract<Item, { kind: 'mosaic' | 'blur' }>; image: HTMLImageElement }) {
  const ref = useRef<Konva.Image>(null)
  const crop = { x: item.x, y: item.y, width: Math.max(1, item.width), height: Math.max(1, item.height) }

  useEffect(() => {
    const node = ref.current!
    node.clearCache()
    if (item.width >= 1 && item.height >= 1) node.cache({ pixelRatio: 1 })
  }, [item.x, item.y, item.width, item.height, item.strength])

  return (
    <Image
      ref={ref}
      image={image}
      crop={crop}
      width={crop.width}
      height={crop.height}
      filters={[item.kind === 'mosaic' ? Konva.Filters.Pixelate : Konva.Filters.Blur]}
      // 정도 1에서 10단계, 모자이크 칸 4에서 40px, 흐림 번짐 6에서 60px (원본 픽셀 기준)
      pixelSize={item.strength * 4}
      blurRadius={item.strength * 6}
    />
  )
}

const iconCache = new Map<string, HTMLImageElement>()

// 내보낼 때 흐려지지 않게 큰 크기로 그린 svg 그림
function Icon({ item }: { item: Extract<Item, { kind: 'icon' }> }) {
  const key = `${item.icon}|${item.color}`
  const [image, setImage] = useState(() => iconCache.get(key))

  useEffect(() => {
    const cached = iconCache.get(key)
    if (cached?.complete) return setImage(cached)
    const element = new window.Image()
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none" stroke="${item.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${STAMP_ICONS[item.icon]}</svg>`
    element.onload = () => {
      iconCache.set(key, element)
      setImage(element)
    }
    element.src = `data:image/svg+xml,${encodeURIComponent(svg)}`
  }, [key])

  return <Image image={image} width={item.size} height={item.size} />
}

function MaskOutline({ item }: { item: Extract<Item, { kind: 'mosaic' | 'blur' }> }) {
  const box = { x: item.x, y: item.y, width: item.width, height: item.height, strokeScaleEnabled: false }
  return (
    <>
      <Rect {...box} stroke="rgba(255,255,255,0.9)" strokeWidth={3} />
      <Rect {...box} stroke="#007aff" strokeWidth={1.5} dash={[6, 4]} />
    </>
  )
}

// 자른 영역 바깥을 한 도형으로 칠함 (네모 여러 개로 나누면 경계에 줄 자국)
function CropShade({ size, crop }: { size: { width: number; height: number }; crop: Box | null }) {
  return (
    <>
      <Shape
        sceneFunc={(context) => {
          context.beginPath()
          context.rect(0, 0, size.width, size.height)
          if (crop) context.rect(crop.x, crop.y, crop.width, crop.height)
          context._context.fillStyle = 'rgba(0,0,0,0.5)'
          context._context.fill('evenodd')
        }}
      />
      {crop && <Rect {...crop} stroke="#ffffff" strokeWidth={1} strokeScaleEnabled={false} dash={[6, 4]} />}
    </>
  )
}

function TextInput({ item, view, zoom, onDone }: { item: Extract<Item, { kind: 'text' }>; view: Box; zoom: number; onDone: (text: string) => void }) {
  const [text, setText] = useState(item.text)
  const ref = useRef<HTMLTextAreaElement>(null)
  const fontSize = item.fontSize * item.scaleY * zoom

  useEffect(() => ref.current!.focus(), [])

  return (
    <textarea
      ref={ref}
      value={text}
      aria-label={t('toolText')}
      placeholder={t('textPlaceholder')}
      rows={Math.max(1, text.split('\n').length)}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => onDone(text)}
      onKeyDown={(event) => event.key === 'Escape' && event.currentTarget.blur()}
      className="absolute resize-none overflow-hidden border border-dashed border-(--ok-accent) bg-transparent p-0 outline-none"
      style={{
        left: (item.x - view.x) * zoom,
        top: (item.y - view.y) * zoom,
        color: item.color,
        fontFamily: FONT_FAMILY[item.font],
        fontSize,
        lineHeight: LINE_HEIGHT,
        width: `max(${fontSize * 6}px, ${Math.max(...text.split('\n').map((line) => line.length)) + 2}ch)`,
      }}
    />
  )
}
