import { flashBadge } from '../../badge'
import { t } from '../../i18n'
import areaSelectScript from './content/area-select.ts?iife'
import elementSelectScript from './content/element-select.ts?iife'
import { PICKED_ATTR, type PickedFrame } from './content/frames'
import type { Point, Slice } from './content/page-scroll'
import pageScrollScript from './content/page-scroll.ts?iife'
import { MAX_PART_HEIGHT, MAX_PART_PIXELS, MAX_SHOTS, deviceScale, frameOriginPattern, fullPageBlock, scrollPositions, sliceDraw, splitParts, toImageRect, type CaptureMode, type Rect } from './shot'
import { deleteCapture, deleteCapturesBefore, saveCapture, type Capture } from './store'

export type CaptureMessage =
  // frameOrigin: 팝업이 그 iframe 주소의 권한을 요청 중이라 결과를 기다려야 함
  | { type: 'capture'; mode: CaptureMode; tabId: number; frameOrigin?: string }
  | { type: 'area-selected'; rect: Rect; viewportWidth: number }
  // frame: 고른 요소가 같은 출처 iframe 안에 있을 때 그 iframe의 위치
  | { type: 'element-selected'; frame?: PickedFrame }
  | { type: 'frame-permission-denied' }

const MODES: CaptureMode[] = ['area', 'element', 'visible', 'full']
const MODE_TITLES: Record<CaptureMode, string> = { area: 'shotArea', element: 'shotElement', visible: 'shotVisible', full: 'shotFullPage' }
const MENU_CONTEXTS: chrome.contextMenus.CreateProperties['contexts'] = ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio']

// captureVisibleTab은 1초에 2번까지라 조금 여유를 둠
const SHOT_INTERVAL = 550
const DAY = 24 * 60 * 60 * 1000
const PERMISSION_TIMEOUT = 60_000

let permissionDenied: (() => void) | undefined
let lastShotAt = 0

export async function createCaptureMenus() {
  await chrome.contextMenus.removeAll()
  chrome.contextMenus.create({ id: 'capture', title: t('menuCapture'), contexts: MENU_CONTEXTS })
  for (const mode of MODES) {
    chrome.contextMenus.create({ id: `capture-${mode}`, parentId: 'capture', title: t(MODE_TITLES[mode]), contexts: MENU_CONTEXTS })
  }
}

export function onCaptureMenuClick(menuItemId: string | number, tab: chrome.tabs.Tab | undefined) {
  const mode = MODES.find((m) => menuItemId === `capture-${m}`)
  if (mode && tab) void startCapture(mode, tab)
}

export async function handleCaptureMessage(message: CaptureMessage, sender: chrome.runtime.MessageSender) {
  if (message.type === 'capture') return startCapture(message.mode, await chrome.tabs.get(message.tabId), message.frameOrigin)
  if (message.type === 'frame-permission-denied') return permissionDenied?.()
  if (message.type === 'area-selected' && sender.tab) {
    const tab = sender.tab
    return run(tab, () => captureArea(tab, message.rect, message.viewportWidth))
  }
  if (message.type === 'element-selected' && sender.tab) {
    const tab = sender.tab
    return run(tab, () => captureElement(tab, sender.frameId ?? 0, message.frame))
  }
}

/**
 * 편집 탭을 닫으면 그 캡처 삭제
 */
export async function onEditorTabRemoved(tabId: number) {
  const key = `editor-${tabId}`
  const { [key]: captureId } = await chrome.storage.session.get(key)
  if (typeof captureId !== 'string') return
  await chrome.storage.session.remove(key)
  await deleteCapture(captureId)
}

export const deleteOldCaptures = () => deleteCapturesBefore(Date.now() - DAY)

async function startCapture(mode: CaptureMode, tab: chrome.tabs.Tab, requestedOrigin?: string) {
  // 선택 영역과 요소는 사용자가 고른 뒤 area-selected, element-selected 메시지로 이어짐
  if (mode === 'area') return run(tab, () => inject(tab, areaSelectScript))
  if (mode === 'element') return run(tab, () => startElementSelect(tab, requestedOrigin))
  // 팝업은 PDF와 canvas 페이지에서 전체 페이지를 흐리게 하지만 우클릭 메뉴는 막을 수 없어 안내만 띄움
  const block = mode === 'full' ? await fullPageBlock(tab.id!) : null
  if (block) return run(tab, () => showNotice(tab.id!, t(block)))
  return run(tab, () => (mode === 'visible' ? captureVisible(tab) : captureFullPage(tab, requestedOrigin)))
}

async function run(tab: chrome.tabs.Tab, task: () => Promise<Capture | void>) {
  try {
    const capture = await task()
    if (capture) await openEditor(capture, tab)
  } catch (error) {
    console.warn('capture failed', error)
    await flashBadge()
  }
}

async function captureVisible(tab: chrome.tabs.Tab): Promise<Capture> {
  const image = await shot(tab.windowId)
  const bitmap = await createImageBitmap(image)
  const scale = deviceScale(bitmap.width, tab.width)
  bitmap.close()
  return newCapture([image], scale)
}

async function captureArea(tab: chrome.tabs.Tab, rect: Rect, viewportWidth: number): Promise<Capture> {
  const bitmap = await createImageBitmap(await shot(tab.windowId))
  const crop = toImageRect(rect, bitmap.width / viewportWidth)
  const canvas = new OffscreenCanvas(crop.width, crop.height)
  canvas.getContext('2d')!.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  const scale = deviceScale(bitmap.width, tab.width)
  bitmap.close()
  return newCapture([await canvas.convertToBlob({ type: 'image/png' })], scale)
}

/**
 * 한 화면씩 내려가며 찍어 이어 붙임, 캔버스 한도를 넘는 길이는 여러 장으로 나눔
 */
async function captureFullPage(tab: chrome.tabs.Tab, requestedOrigin?: string): Promise<Capture> {
  const tabId = tab.id!
  // 권한이 없거나 거절하면 바깥 문서를 찍음 (화면 한 장)
  const frame = await contentFrame(tab, requestedOrigin)
  const frameId = frame?.frameId
  const target = { tabId, frameIds: frameId === undefined ? undefined : [frameId] }
  if (frameId !== undefined) await chrome.scripting.executeScript({ target, files: [pageScrollScript] })
  try {
    const page = await callPage(target, (steps) => window.omniKitPageScroll!.prepare(steps), [MAX_SHOTS])
    if (frame) {
      // iframe 안 좌표를 바깥 화면 좌표로 옮기고 iframe 밖으로 나간 부분은 자름
      const x = frame.rect.x + page.rect.x
      const y = frame.rect.y + page.rect.y
      page.rect = { x, y, width: Math.min(page.rect.width, frame.rect.x + frame.rect.width - x), height: Math.min(page.rect.height, frame.rect.y + frame.rect.height - y) }
      page.viewport = page.rect.height
      page.viewportWidth = frame.viewportWidth
    }
    const positions = scrollPositions(page.total, page.viewport)
    const contentHeight = positions.at(-1)! + page.viewport
    const place = async (y: number): Promise<Slice[]> => [{ rect: page.rect, left: 0, top: await callPage(target, (y) => window.omniKitPageScroll!.scrollTo(y), [y]) }]
    return await stitch(tab, target, positions, { width: page.rect.width, height: contentHeight }, page.viewportWidth, place)
  } finally {
    await callPage(target, () => window.omniKitPageScroll!.restore()).catch(() => {})
    await clearProgress()
  }
}

/**
 * 고른 요소를 찍음, 화면보다 길거나 넓으면 스크롤하며 이어 붙임
 */
async function captureElement(tab: chrome.tabs.Tab, senderFrameId: number, picked?: PickedFrame): Promise<Capture> {
  const tabId = tab.id!
  const frame = senderFrameId === 0 ? picked : await inContentFrame(tab, picked)
  const frameId = picked ? await findPickedFrameId(tabId) : senderFrameId
  if (frameId === undefined) throw new Error('picked frame is gone')
  const target = { tabId, frameIds: [frameId] }
  // iframe 안 요소는 미리 잰 iframe 위치가 바뀌지 않게 맨 위 문서에도 막을 깖 (맨 위의 스크롤과 스타일은 건드리지 않음)
  const top = { tabId, frameIds: [0] }
  try {
    if (frameId !== 0) {
      await chrome.scripting.executeScript({ target: top, files: [pageScrollScript] })
      await callPage(top, () => window.omniKitPageScroll!.block())
    }
    await chrome.scripting.executeScript({ target, files: [pageScrollScript] })
    const element = await callPage(target, (visible) => window.omniKitPageScroll!.prepareElement(visible), [frame?.visible ?? null])
    // iframe 안 좌표를 맨 위 화면 좌표로 옮김
    const place = async (point: Point) => {
      const slices = await callPage(target, (point) => window.omniKitPageScroll!.scrollElement(point), [point])
      // 조각은 iframe 안 좌표라 iframe 위치를 그 배율로 나눠 더하고, 화면 폭도 같은 배율로 나눠 찍힌 그림 배율을 맞춤
      return frame ? slices.map((slice) => ({ ...slice, rect: { ...slice.rect, x: slice.rect.x + frame.x / frame.scale, y: slice.rect.y + frame.y / frame.scale } })) : slices
    }
    return await stitch(tab, target, element.positions, element, frame ? frame.viewportWidth / frame.scale : element.viewportWidth, place)
  } finally {
    await callPage(target, () => window.omniKitPageScroll!.restore()).catch(() => {})
    if (frameId !== 0) await callPage(top, () => window.omniKitPageScroll?.unblock()).catch(() => {})
    await clearProgress()
  }
}

/**
 * 내용이 다른 주소의 큰 iframe 하나인 페이지(claude.ai 아티팩트 등)에서 권한이 있으면 그 iframe 안에서 고름
 */
async function startElementSelect(tab: chrome.tabs.Tab, requestedOrigin?: string) {
  const frame = await contentFrame(tab, requestedOrigin)
  await chrome.scripting.executeScript({ target: { tabId: tab.id!, frameIds: frame ? [frame.frameId] : undefined }, files: [elementSelectScript] })
}

/**
 * 큰 iframe 안에서 고른 요소의 위치를 맨 위 화면 기준으로 바꿈, picked는 그 iframe 안의 같은 출처 iframe
 */
async function inContentFrame(tab: chrome.tabs.Tab, picked?: PickedFrame): Promise<PickedFrame> {
  await inject(tab, pageScrollScript)
  const outer = await callPage(tab.id!, () => window.omniKitPageScroll!.findFrame())
  if (!outer) throw new Error('content frame is gone')
  const { x = 0, y = 0, scale = 1, visible = { x: 0, y: 0, width: outer.rect.width, height: outer.rect.height } } = picked ?? {}
  return { x: outer.rect.x + x, y: outer.rect.y + y, scale, visible, viewportWidth: outer.viewportWidth }
}

/**
 * 스크롤 위치마다 찍은 화면 조각을 이어 붙임, 캔버스 한도를 넘는 길이는 여러 장으로 나눔
 * 위치는 위에서 아래 순서여야 함 (위쪽 장부터 마무리)
 */
async function stitch<Position>(
  tab: chrome.tabs.Tab,
  target: chrome.scripting.InjectionTarget,
  positions: Position[],
  size: { width: number; height: number },
  viewportWidth: number,
  place: (position: Position) => Promise<Slice[]>,
): Promise<Capture> {
  const parts: Blob[] = []
  const canvases = new Map<number, OffscreenCanvas>()
  let layout: ReturnType<typeof splitParts> = []
  let width = 0
  let finished = 0
  let drawnBottom = 0
  let imageScale: number | undefined

  const finishPartsBefore = async (y: number) => {
    while (finished < layout.length && layout[finished].top + layout[finished].height <= y) {
      let canvas = canvases.get(finished)!
      if (canvas.height > layout[finished].height) {
        const cut = new OffscreenCanvas(canvas.width, layout[finished].height)
        cut.getContext('2d')!.drawImage(canvas, 0, 0)
        canvas = cut
      }
      parts.push(await canvas.convertToBlob({ type: 'image/png' }))
      canvases.delete(finished)
      finished++
    }
  }

  for (const [index, position] of positions.entries()) {
    await showProgress(index, positions.length)
    const slices = await place(position)
    if (!(await chrome.tabs.get(target.tabId)).active) throw new Error('tab changed during capture')
    const bitmap = await createImageBitmap(await shot(tab.windowId))
    const scale = bitmap.width / viewportWidth
    if (index === 0) {
      imageScale = deviceScale(bitmap.width, tab.width)
      width = Math.min(Math.round(size.width * scale), MAX_PART_HEIGHT)
      layout = splitParts(Math.round(size.height * scale), Math.min(MAX_PART_HEIGHT, Math.floor(MAX_PART_PIXELS / width)))
    }
    await finishPartsBefore(Math.min(...slices.map(({ top }) => Math.round(top * scale))))
    for (const { rect, left, top } of slices) {
      for (const [sx, sy, sw, sh, dx, dy, dw, dh] of sliceDraw(rect, left, top, scale, bitmap)) {
        for (let part = finished; part < layout.length && layout[part].top < dy + dh; part++) {
          if (!canvases.has(part)) canvases.set(part, new OffscreenCanvas(width, layout[part].height))
          const context = canvases.get(part)!.getContext('2d')!
          context.drawImage(bitmap, sx, sy, sw, sh, dx, dy - layout[part].top, dw, dh)
        }
        drawnBottom = Math.max(drawnBottom, dy + dh)
      }
    }
    bitmap.close()
    if (index === 0) await callPage(target, () => window.omniKitPageScroll!.hideFixed())
  }
  // 가상 목록(GitHub 보드 등)은 내리면서 그린 카드의 실제 높이가 처음 어림한 높이보다 작아 그린 곳까지만 남김
  layout = layout.filter(({ top }) => top < drawnBottom).map((part) => ({ ...part, height: Math.min(part.height, drawnBottom - part.top) }))
  await finishPartsBefore(Infinity)
  return newCapture(parts, imageScale)
}

/**
 * 화면 가운데에 3초 동안 띄우는 안내 상자, PDF 보기의 짙은 회색 화면에서도 보이게 테마와 상관없이 검정 바탕
 */
async function showNotice(tabId: number, message: string) {
  await chrome.scripting.executeScript({
    target: { tabId },
    args: [message],
    func: (message) => {
      document.getElementById('omni-kit-notice')?.remove()
      const notice = document.createElement('div')
      notice.id = 'omni-kit-notice'
      notice.textContent = message
      notice.style.cssText = [
        'all: initial',
        'position: fixed',
        'top: 50%',
        'left: 50%',
        'transform: translate(-50%, -50%)',
        'z-index: 2147483647',
        'pointer-events: none',
        'padding: 14px 20px',
        'border-radius: 12px',
        'background: rgb(0 0 0 / 0.85)',
        'color: #fff',
        'box-shadow: 0 4px 16px rgb(0 0 0 / 0.3)',
        'font: 600 15px -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      ].join(';')
      document.documentElement.append(notice)
      setTimeout(() => notice.remove(), 3000)
    },
  })
}

// 전체 페이지 바로 뒤에 다른 찍기를 해도 한도에 걸리지 않게 모든 찍기의 간격을 맞춤
async function shot(windowId: number): Promise<Blob> {
  await new Promise((done) => setTimeout(done, lastShotAt + SHOT_INTERVAL - Date.now()))
  lastShotAt = Date.now()
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
  return (await fetch(dataUrl)).blob()
}

async function inject(tab: chrome.tabs.Tab, file: string) {
  await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: [file] })
}

async function callPage<Args extends unknown[], Result>(
  target: number | chrome.scripting.InjectionTarget,
  func: (...args: Args) => Result,
  args?: Args,
): Promise<Awaited<Result>> {
  const injectionTarget = typeof target === 'number' ? { tabId: target } : target
  const [injection] = await chrome.scripting.executeScript({ target: injectionTarget, func, args: args ?? ([] as unknown as Args) })
  return injection.result as Awaited<Result>
}

/**
 * iframe 주소의 권한 확인, 팝업이 요청 중이면 사용자가 크롬 허용 창에서 고를 때까지 기다림
 */
async function allowFrame(origin: string, requested: boolean): Promise<boolean> {
  const origins = [frameOriginPattern(origin)]
  if (await chrome.permissions.contains({ origins })) return true
  if (!requested) return false
  return new Promise((resolve) => {
    const finish = (granted: boolean) => {
      clearTimeout(timer)
      clearInterval(keepAlive)
      chrome.permissions.onAdded.removeListener(onAdded)
      permissionDenied = undefined
      resolve(granted)
    }
    const onAdded = () => void chrome.permissions.contains({ origins }).then((granted) => granted && finish(true))
    const timer = setTimeout(() => finish(false), PERMISSION_TIMEOUT)
    // 서비스 워커는 확장 API 호출 없이 30초가 지나면 꺼져 기다림이 사라지므로 그 전에 가벼운 호출
    const keepAlive = setInterval(() => void chrome.runtime.getPlatformInfo(), 20_000)
    chrome.permissions.onAdded.addListener(onAdded)
    permissionDenied = () => finish(false)
  })
}

/**
 * 문서가 스크롤되지 않고 내용이 다른 주소의 큰 iframe 안에 있는 페이지의 그 iframe, 권한이 없거나 거절하면 없음
 */
async function contentFrame(tab: chrome.tabs.Tab, requestedOrigin?: string) {
  await inject(tab, pageScrollScript)
  const frame = await callPage(tab.id!, () => window.omniKitPageScroll!.findFrame())
  const frameId = frame && (await allowFrame(frame.origin, frame.origin === requestedOrigin)) ? await findFrameId(tab.id!, frame.origin) : undefined
  return frame && frameId !== undefined ? { ...frame, frameId } : undefined
}

/** 고른 요소를 표시해 둔 프레임 */
async function findPickedFrameId(tabId: number): Promise<number | undefined> {
  const frames = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: (attr) => document.querySelector(`[${attr}]`) !== null,
    args: [PICKED_ATTR],
  })
  return frames.find(({ result }) => result)?.frameId
}

/** 그 주소의 iframe 중 가장 큰 것 */
async function findFrameId(tabId: number, origin: string): Promise<number | undefined> {
  const frames = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: () => ({ origin: location.origin, area: innerWidth * innerHeight }),
  })
  return frames
    .filter(({ frameId, result }) => frameId !== 0 && result?.origin === origin)
    .sort((a, b) => b.result!.area - a.result!.area)[0]?.frameId
}

const newCapture = (parts: Blob[], scale: number | undefined): Capture => ({ id: crypto.randomUUID(), createdAt: Date.now(), parts, scale })

async function openEditor(capture: Capture, tab: chrome.tabs.Tab) {
  await saveCapture(capture)
  const editor = await chrome.tabs.create({
    url: chrome.runtime.getURL(`capture.html?id=${capture.id}`),
    windowId: tab.windowId,
    index: tab.index + 1,
  })
  await chrome.storage.session.set({ [`editor-${editor.id}`]: capture.id })
}

async function showProgress(done: number, total: number) {
  await chrome.action.setBadgeBackgroundColor({ color: '#007aff' })
  await chrome.action.setBadgeText({ text: `${Math.round((done / total) * 100)}%` })
  await chrome.action.setTitle({ title: t('capturing', [done + 1, total]) })
}

async function clearProgress() {
  await chrome.action.setBadgeText({ text: '' })
  await chrome.action.setTitle({ title: t('actionTitle') })
}
