import { openBookmarkSlot, type BookmarkMessage } from '../features/bookmark-shortcuts/background'
import { commandName } from '../features/bookmark-shortcuts/slots'
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

chrome.runtime.onMessage.addListener((message: CaptureMessage | BookmarkMessage, sender) => {
  if (message.type === 'open-bookmark') return void openBookmarkSlot(commandName(message.index))
  void handleCaptureMessage(message, sender)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  void onEditorTabRemoved(tabId)
})

void deleteOldCaptures()

if (import.meta.env.MODE !== 'release') void markDevIcon()
