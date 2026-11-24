import { useEffect, useState } from 'react'
import { t } from '../../i18n'
import { SLOT_COUNT, bookmarkLabel, commandName, loadBarBookmarkIds, loadSlots, saveSlot, type Slots } from './slots'

const RESULT_LIMIT = 50

type Bookmark = { id: string; title: string; url: string }

type Slot = { bookmark: Bookmark | null; picked: boolean }

async function findBookmark(id: string): Promise<Bookmark | null> {
  try {
    const [node] = await chrome.bookmarks.get(id)
    return node?.url ? { id: node.id, title: bookmarkLabel(node.title, node.url), url: node.url } : null
  } catch {
    return null
  }
}

export function BookmarkShortcutsPanel() {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<number | null>(null)

  const applySlots = async (ids: Slots) => {
    const barIds = await loadBarBookmarkIds()
    setSlots(
      await Promise.all(
        ids.map(async (id, i) => {
          const bookmarkId = id ?? barIds[i]
          return { bookmark: bookmarkId ? await findBookmark(bookmarkId) : null, picked: id !== null }
        }),
      ),
    )
  }

  useEffect(() => {
    void (async () => {
      const commands = await chrome.commands.getAll()
      setShortcuts(Object.fromEntries(commands.map((command) => [command.name ?? '', command.shortcut ?? ''])))
      await applySlots(await loadSlots())
    })()
  }, [])

  const assign = async (index: number, bookmarkId: string | null) => {
    setEditing(null)
    await applySlots(await saveSlot(index, bookmarkId))
  }

  if (!slots) return null

  return (
    <div className="flex flex-col gap-4">
      <ol className="overflow-hidden rounded-xl bg-(--ok-cell)">
        {Array.from({ length: SLOT_COUNT }, (_, index) => {
          const { bookmark, picked } = slots[index]
          const open = editing === index
          return (
            <li key={index}>
              {index > 0 && <div className="ms-10 h-px bg-(--ok-fill)" />}
              <button
                type="button"
                aria-label={t('changeSlot', index + 1)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-(--ok-fill)"
                onClick={() => setEditing(open ? null : index)}
              >
                {bookmark ? <Favicon url={bookmark.url} /> : <span className="size-4 shrink-0 translate-y-px rounded bg-(--ok-fill)" />}
                <span className={`min-w-0 flex-1 truncate ${picked ? '' : 'text-(--ok-label-2)'}`} title={bookmark?.url}>
                  {bookmark?.title ?? t('slotEmpty')}
                </span>
                <kbd dir="ltr" className="shrink-0 font-sans text-(--ok-label-2)">{shortcuts[commandName(index)] || t('noShortcut')}</kbd>
                <Chevron open={open} />
              </button>
              {open && (
                <div className="mt-2 flex flex-col gap-2 px-3 pb-3 ps-10">
                  <BookmarkPicker onPick={(id) => assign(index, id)} />
                  {picked && (
                    <button
                      type="button"
                      className="self-start text-(--ok-destructive)"
                      aria-label={t('clearSlot', index + 1)}
                      onClick={() => assign(index, null)}
                    >
                      {t('clear')}
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <button
        type="button"
        className="flex w-full items-center rounded-xl bg-(--ok-cell) px-3 py-2.5 text-start text-(--ok-accent) hover:bg-(--ok-fill)"
        onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
      >
        <span className="flex-1">{t('editShortcuts')}</span>
        <Chevron open={false} />
      </button>
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 8 13"
      aria-hidden="true"
      // 아랍어 화면은 좌우 반전, 펼칠 때 반대로 회전해 아래 방향 유지
      className={`h-3 w-2 shrink-0 text-(--ok-label-3) transition-transform rtl:-scale-x-100 ${open ? 'rotate-90 rtl:-rotate-90' : ''}`}
    >
      <path d="M1.5 1.5 6.5 6.5 1.5 11.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BookmarkPicker({ onPick }: { onPick: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Bookmark[]>([])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return setResults([])
    let cancelled = false
    void (async () => {
      const nodes = await chrome.bookmarks.search(trimmed)
      if (cancelled) return
      setResults(
        nodes
          .filter((node) => node.url)
          .slice(0, RESULT_LIMIT)
          .map((node) => ({ id: node.id, title: bookmarkLabel(node.title, node.url!), url: node.url! })),
      )
    })()
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className="flex flex-col gap-1">
      <input
        type="search"
        autoFocus
        aria-label={t('searchBookmarks')}
        placeholder={t('searchBookmarks')}
        className="rounded-lg bg-(--ok-fill) px-2.5 py-1.5 outline-none placeholder:text-(--ok-label-2) focus:ring-2 focus:ring-(--ok-accent)/40"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query.trim() && results.length === 0 && <p className="mt-1.5 px-1 text-xs text-(--ok-label-2)">{t('noResults')}</p>}
      <ul className="ok-scroll max-h-40 overflow-y-auto overscroll-contain">
        {results.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-(--ok-fill)"
              title={result.url}
              onClick={() => onPick(result.id)}
            >
              <Favicon url={result.url} />
              <span className="truncate">{result.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 크롬이 저장해 둔 파비콘 사용 (favicon 권한)
 */
function Favicon({ url }: { url: string }) {
  const src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(url)}&size=16`)
  return <img src={src} alt="" className="size-4 shrink-0 translate-y-px" />
}
