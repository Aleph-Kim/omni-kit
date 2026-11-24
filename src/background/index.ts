import { openBookmarkSlot } from '../features/bookmark-shortcuts/background'

chrome.commands.onCommand.addListener((command) => {
  void openBookmarkSlot(command)
})
