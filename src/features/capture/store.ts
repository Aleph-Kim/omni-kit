export type Capture = { id: string; createdAt: number; parts: Blob[]; truncated: boolean }

const DB_NAME = 'omni-kit-capture'
const STORE = 'captures'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('createdAt', 'createdAt')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode)
      const request = action(transaction.objectStore(STORE))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export const saveCapture = (capture: Capture) => run('readwrite', (store) => store.put(capture))

export const loadCapture = (id: string) => run<Capture | undefined>('readonly', (store) => store.get(id))

export const deleteCapture = (id: string) => run('readwrite', (store) => store.delete(id))

/**
 * 편집 탭이 닫히지 않은 채 크롬이 꺼진 경우 등 남은 캡처 정리
 */
export const deleteCapturesBefore = (time: number) =>
  run('readwrite', (store) => {
    const request = store.index('createdAt').openKeyCursor(IDBKeyRange.upperBound(time, true))
    request.onsuccess = () => {
      if (!request.result) return
      store.delete(request.result.primaryKey)
      request.result.continue()
    }
    return request
  })
