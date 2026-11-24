import { flashBadge } from '../../badge'
import { t } from '../../i18n'
import areaSelectScript from './content/area-select.ts?iife'
import pageScrollScript from './content/page-scroll.ts?iife'
import { MAX_SHOTS, scrollPositions, splitParts, toImageRect, type CaptureMode, type Rect } from './shot'
import { deleteCapture, deleteCapturesBefore, saveCapture, type Capture } from './store'

export type CaptureMessage =
  | { type: 'capture'; mode: CaptureMode; tabId: number }
  | { type: 'area-selected'; rect: Rect; viewportWidth: number }

const MODES: CaptureMode[] = ['area', 'visible', 'full']
const MODE_TITLES: Record<CaptureMode, string> = { area: 'shotArea', visible: 'shotVisible', full: 'shotFullPage' }
const MENU_CONTEXTS: chrome.contextMenus.CreateProperties['contexts'] = ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio']

// captureVisibleTab은 1초에 2번까지라 조금 여유를 둠
const SHOT_INTERVAL = 550
const DAY = 24 * 60 * 60 * 1000

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
  if (message.type === 'capture') return startCapture(message.mode, await chrome.tabs.get(message.tabId))
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

async function startCapture(mode: CaptureMode, tab: chrome.tabs.Tab) {
  // 선택 영역은 사용자가 고른 뒤 area-selected 메시지로 이어짐
  if (mode === 'area') return run(tab, () => inject(tab, areaSelectScript))
  return run(tab, () => (mode === 'visible' ? captureVisible(tab) : captureFullPage(tab)))
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
  return newCapture([await shot(tab.windowId)], false)
}

async function captureArea(tab: chrome.tabs.Tab, rect: Rect, viewportWidth: number): Promise<Capture> {
  const bitmap = await createImageBitmap(await shot(tab.windowId))
  const crop = toImageRect(rect, bitmap.width / viewportWidth)
  const canvas = new OffscreenCanvas(crop.width, crop.height)
  canvas.getContext('2d')!.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  bitmap.close()
  return newCapture([await canvas.convertToBlob({ type: 'image/png' })], false)
}

/**
 * 한 화면씩 내려가며 찍어 이어 붙임, 캔버스 한도를 넘는 길이는 여러 장으로 나눔
 */
async function captureFullPage(tab: chrome.tabs.Tab): Promise<Capture> {
  const tabId = tab.id!
  await inject(tab, pageScrollScript)
  try {
    const page = await callPage(tabId, (steps) => window.omniKitPageScroll!.prepare(steps), [MAX_SHOTS])
    const { positions, truncated } = scrollPositions(page.total, page.viewport)
    const contentHeight = positions.at(-1)! + page.viewport
    const parts: Blob[] = []
    const canvases = new Map<number, OffscreenCanvas>()
    let layout: ReturnType<typeof splitParts> = []
    let finished = 0
    let lastShotAt = 0

    const finishPartsBefore = async (y: number) => {
      while (finished < layout.length && layout[finished].top + layout[finished].height <= y) {
        parts.push(await canvases.get(finished)!.convertToBlob({ type: 'image/png' }))
        canvases.delete(finished)
        finished++
      }
    }

    for (const [index, y] of positions.entries()) {
      await showProgress(index, positions.length)
      const top = await callPage(tabId, (y) => window.omniKitPageScroll!.scrollTo(y), [y])
      if (!(await chrome.tabs.get(tabId)).active) throw new Error('tab changed during capture')
      await new Promise((done) => setTimeout(done, lastShotAt + SHOT_INTERVAL - Date.now()))
      lastShotAt = Date.now()
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
      if (index === 0) await callPage(tabId, () => window.omniKitPageScroll!.hideFixed())
    }
    await finishPartsBefore(Infinity)
    return newCapture(parts, truncated)
  } finally {
    await callPage(tabId, () => window.omniKitPageScroll!.restore()).catch(() => {})
    await clearProgress()
  }
}

async function shot(windowId: number): Promise<Blob> {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
  return (await fetch(dataUrl)).blob()
}

async function inject(tab: chrome.tabs.Tab, file: string) {
  await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: [file] })
}

async function callPage<Args extends unknown[], Result>(tabId: number, func: (...args: Args) => Result, args?: Args): Promise<Awaited<Result>> {
  const [injection] = await chrome.scripting.executeScript({ target: { tabId }, func, args: args ?? ([] as unknown as Args) })
  return injection.result as Awaited<Result>
}

const newCapture = (parts: Blob[], truncated: boolean): Capture => ({ id: crypto.randomUUID(), createdAt: Date.now(), parts, truncated })

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
