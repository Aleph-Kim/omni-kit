import { openBookmarkSlot } from '../features/bookmark-shortcuts/background'
import {
  createCaptureMenus,
  deleteOldCaptures,
  handleCaptureMessage,
  onCaptureMenuClick,
  onEditorTabRemoved,
  type CaptureMessage,
} from '../features/capture/background'
import { markDevIcon } from './dev-icon'

chrome.commands.onCommand.addListener((command) => {
  void openBookmarkSlot(command)
})

chrome.runtime.onInstalled.addListener(() => {
  void createCaptureMenus()
})

chrome.contextMenus.onClicked.addListener((info, tab) => onCaptureMenuClick(info.menuItemId, tab))

chrome.runtime.onMessage.addListener((message: CaptureMessage, sender) => {
  void handleCaptureMessage(message, sender)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  void onEditorTabRemoved(tabId)
})

void deleteOldCaptures()

if (import.meta.env.MODE !== 'release') void markDevIcon()
