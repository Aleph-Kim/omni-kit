export const t = (key: string, substitutions?: string | number | (string | number)[]) =>
  chrome.i18n.getMessage(key, substitutions === undefined ? undefined : [substitutions].flat().map(String)) || key

// 지원 언어 중 아랍어만 오른쪽에서 왼쪽으로 배치
export const uiDir = () => (chrome.i18n.getMessage('@@ui_locale').startsWith('ar') ? 'rtl' : 'ltr')
