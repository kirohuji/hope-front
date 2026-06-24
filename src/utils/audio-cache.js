/**
 * IndexedDB 音频缓存工具
 * - 按 URL 缓存音频 Blob
 * - 3 天自动过期
 */

const DB_NAME = 'hope-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio-blobs';
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 天

let dbInstance = null;

function openDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 清理过期条目
 */
async function cleanExpired() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();

    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const { timestamp } = cursor.value;
        if (now - timestamp > MAX_AGE_MS) {
          store.delete(cursor.key);
        }
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve(); // 静默处理
  });
}

/**
 * 从缓存获取音频 Blob（未过期才返回）
 * @param {string} url - 原始音频 URL
 * @returns {Promise<Blob|null>}
 */
export async function getCachedAudio(url) {
  try {
    await cleanExpired();
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const { blob, timestamp } = entry;
        if (Date.now() - timestamp > MAX_AGE_MS) {
          // 过期，删掉
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(url);
          resolve(null);
          return;
        }

        resolve(blob);
      };

      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

/**
 * 缓存音频到 IndexedDB
 * @param {string} url - 原始音频 URL 作为 key
 * @param {Blob} blob - 音频 Blob
 */
export async function setCachedAudio(url, blob) {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob, timestamp: Date.now() }, url);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // 静默处理
    return undefined;
  }
}

/**
 * 下载音频并缓存
 * @param {string} url
 * @returns {Promise<string>} Object URL
 */
export async function loadAndCacheAudio(url) {
  // 先尝试从缓存获取
  const cached = await getCachedAudio(url);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  // 缓存未命中，下载
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);

  const blob = await response.blob();

  // 存缓存（不 await，不阻塞返回）
  setCachedAudio(url, blob).catch(() => {});

  return URL.createObjectURL(blob);
}

/**
 * 预下载音频（强制刷新缓存）
 * @param {string} url
 */
export async function prefetchAudio(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const blob = await response.blob();
    await setCachedAudio(url, blob);
  } catch {
    // 静默处理
  }
}
