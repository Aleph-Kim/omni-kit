export type History<T> = { past: T[]; present: T; future: T[] }

const LIMIT = 100

export const initHistory = <T>(present: T): History<T> => ({ past: [], present, future: [] })

export function commit<T>(history: History<T>, next: T): History<T> {
  if (next === history.present) return history
  return { past: [...history.past, history.present].slice(-LIMIT), present: next, future: [] }
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1)
  if (previous === undefined) return history
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] }
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...future] = history.future
  if (next === undefined) return history
  return { past: [...history.past, history.present], present: next, future }
}
