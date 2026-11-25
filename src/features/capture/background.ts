import { flashBadge } from '../../badge'
import { t } from '../../i18n'
import areaSelectScript from './content/area-select.ts?iife'
import pageScrollScript from './content/page-scroll.ts?iife'
import { MAX_SHOTS, frameOriginPattern, isPdf, scrollPositions, splitParts, toImageRect, type CaptureMode, type Rect } from './shot'
import { deleteCapture, deleteCapturesBefore, saveCapture, type Capture } from './store'

export type CaptureMessage =
  // frameOrigin: 팝업이 그 iframe 주소의 권한을 요청 중이라 결과를 기다려야 함
  | { type: 'capture'; mode: CaptureMode; tabId: number; frameOrigin?: string }
  | { type: 'area-selected'; rect: Rect; viewportWidth: number }
  | { type: 'frame-permission-denied' }

const MODES: CaptureMode[] = ['area', 'visible', 'full']
const MODE_TITLES: Record<CaptureMode, string> = { area: 'shotArea', visible: 'shotVisible', full: 'shotFullPage' }
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
  // 선택 영역은 사용자가 고른 뒤 area-selected 메시지로 이어짐
  if (mode === 'area') return run(tab, () => inject(tab, areaSelectScript))
  // 팝업은 PDF에서 전체 페이지를 흐리게 하지만 우클릭 메뉴는 막을 수 없어 안내만 띄움
  if (mode === 'full' && (await isPdf(tab.id!))) return run(tab, () => showNotice(tab.id!, t('captureNoFullPdf')))
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
  return newCapture([await shot(tab.windowId)])
}

async function captureArea(tab: chrome.tabs.Tab, rect: Rect, viewportWidth: number): Promise<Capture> {
  const bitmap = await createImageBitmap(await shot(tab.windowId))
  const crop = toImageRect(rect, bitmap.width / viewportWidth)
  const canvas = new OffscreenCanvas(crop.width, crop.height)
  canvas.getContext('2d')!.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  bitmap.close()
  return newCapture([await canvas.convertToBlob({ type: 'image/png' })])
}

/**
 * 한 화면씩 내려가며 찍어 이어 붙임, 캔버스 한도를 넘는 길이는 여러 장으로 나눔
 */
async function captureFullPage(tab: chrome.tabs.Tab, requestedOrigin?: string): Promise<Capture> {
  const tabId = tab.id!
  await inject(tab, pageScrollScript)
  const frame = await callPage(tabId, () => window.omniKitPageScroll!.findFrame())
  // 권한이 없거나 거절하면 바깥 문서를 찍음 (화면 한 장)
  const frameId = frame && (await allowFrame(frame.origin, frame.origin === requestedOrigin)) ? await findFrameId(tabId, frame.origin) : undefined
  const target = { tabId, frameIds: frameId === undefined ? undefined : [frameId] }
  if (frameId !== undefined) await chrome.scripting.executeScript({ target, files: [pageScrollScript] })
  try {
    const page = await callPage(target, (steps) => window.omniKitPageScroll!.prepare(steps), [MAX_SHOTS])
    if (frame && frameId !== undefined) {
      // iframe 안 좌표를 바깥 화면 좌표로 옮기고 iframe 밖으로 나간 부분은 자름
      const x = frame.rect.x + page.rect.x
      const y = frame.rect.y + page.rect.y
      page.rect = { x, y, width: Math.min(page.rect.width, frame.rect.x + frame.rect.width - x), height: Math.min(page.rect.height, frame.rect.y + frame.rect.height - y) }
      page.viewport = page.rect.height
      page.viewportWidth = frame.viewportWidth
    }
    const positions = scrollPositions(page.total, page.viewport)
    const contentHeight = positions.at(-1)! + page.viewport
    const parts: Blob[] = []
    const canvases = new Map<number, OffscreenCanvas>()
    let layout: ReturnType<typeof splitParts> = []
    let finished = 0

    const finishPartsBefore = async (y: number) => {
      while (finished < layout.length && layout[finished].top + layout[finished].height <= y) {
        parts.push(await canvases.get(finished)!.convertToBlob({ type: 'image/png' }))
        canvases.delete(finished)
        finished++
      }
    }

    for (const [index, y] of positions.entries()) {
      await showProgress(index, positions.length)
      const top = await callPage(target, (y) => window.omniKitPageScroll!.scrollTo(y), [y])
      if (!(await chrome.tabs.get(tabId)).active) throw new Error('tab changed during capture')
      const bitmap = await createImageBitmap(await shot(tab.windowId))
      const scale = bitmap.width / page.viewportWidth
      const crop = toImageRect(page.rect, scale)
      if (index === 0) layout = splitParts(Math.round(contentHeight * scale))
      const destY = Math.round(top * scale)
      await finishPartsBefore(destY)
      for (let part = finished; part < layout.length && layout[part].top < destY + crop.height; part++) {
        if (!canvases.has(part)) canvases.set(part, new OffscreenCanvas(crop.width, layout[part].height))
        const context = canvases.get(part)!.getContext('2d')!
        context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, destY - layout[part].top, crop.width, crop.height)
      }
      bitmap.close()
      if (index === 0) await callPage(target, () => window.omniKitPageScroll!.hideFixed())
    }
    await finishPartsBefore(Infinity)
    return newCapture(parts)
  } finally {
    await callPage(target, () => window.omniKitPageScroll!.restore()).catch(() => {})
    await clearProgress()
  }
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
      chrome.permissions.onAdded.removeListener(onAdded)
      permissionDenied = undefined
      resolve(granted)
    }
    const onAdded = () => void chrome.permissions.contains({ origins }).then((granted) => granted && finish(true))
    const timer = setTimeout(() => finish(false), PERMISSION_TIMEOUT)
    chrome.permissions.onAdded.addListener(onAdded)
    permissionDenied = () => finish(false)
  })
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

const newCapture = (parts: Blob[]): Capture => ({ id: crypto.randomUUID(), createdAt: Date.now(), parts })

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
