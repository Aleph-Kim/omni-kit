export const t = (key: string, substitution?: string | number) =>
  chrome.i18n.getMessage(key, substitution === undefined ? undefined : String(substitution)) || key
