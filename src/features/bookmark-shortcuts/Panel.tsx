import { useEffect, useState } from 'react'
import { t } from '../../i18n'
import { Chevron } from '../../ui/Chevron'
import { SectionTitle } from '../../ui/SectionTitle'
import type { BookmarkMessage } from './background'
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

export function BookmarkShortcutsPanel({ titleId, title }: { titleId: string; title: string }) {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({})
  const [listOpen, setListOpen] = useState(false)
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

  // 실패 배지가 팝업과 같이 사라지지 않게 여는 일은 백그라운드가 함
  const openSlot = (index: number) => {
    void chrome.runtime.sendMessage({ type: 'open-bookmark', index } satisfies BookmarkMessage)
    window.close()
  }

  if (!slots) return null

  return (
    <>
      <SectionTitle
        id={titleId}
        action={
          <button
            type="button"
            aria-expanded={listOpen}
            className="text-(--ok-accent) hover:underline"
            onClick={() => {
              setListOpen(!listOpen)
              setEditing(null)
            }}
          >
            {t('editBookmarks')}
          </button>
        }
      >
        {title}
      </SectionTitle>
      <ol className="grid grid-cols-9 rounded-xl bg-(--ok-cell) px-1.5 py-2">
        {slots.map(({ bookmark }, index) => {
          const shortcut = shortcuts[commandName(index)] || t('noShortcut')
          const name = bookmark?.title ?? t('slotEmpty')
          return (
            <li key={index} className="group relative flex justify-center">
              <button
                type="button"
                aria-label={`${name}, ${shortcut}`}
                className="grid size-8 place-items-center rounded-full hover:bg-(--ok-fill)"
                onClick={() => {
                  if (bookmark) return openSlot(index)
                  setListOpen(true)
                  setEditing(index)
                }}
              >
                {bookmark ? (
                  <Favicon url={bookmark.url} />
                ) : (
                  <span className="size-3.5 rounded-full border-[1.5px] border-dashed border-(--ok-label-3)" />
                )}
              </button>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden max-w-60 items-center gap-1.5 rounded-lg bg-(--ok-cell) px-2.5 py-1.5 text-xs whitespace-nowrap text-(--ok-label) shadow-lg ring-1 ring-(--ok-fill) group-hover:flex group-has-focus-visible:flex ${tipPlacement(index)}`}
              >
                <span className="truncate">{name}</span>
                <kbd dir="ltr" className="shrink-0 font-sans text-(--ok-label-2)">
                  {shortcut}
                </kbd>
              </span>
            </li>
          )
        })}
      </ol>
      {listOpen && (
        <div className="mt-4 flex flex-col gap-4">
          <ol className="overflow-hidden rounded-xl bg-(--ok-cell)">
            {slots.map(({ bookmark, picked }, index) => {
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
      )}
    </>
  )
}

/**
 * 말풍선이 팝업 밖으로 잘리지 않게 양 끝 칸은 시작이나 끝에 맞춤
 */
function tipPlacement(index: number) {
  if (index < 3) return 'start-0'
  if (index >= SLOT_COUNT - 3) return 'end-0'
  return 'left-1/2 -translate-x-1/2'
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
