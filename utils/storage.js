const STORAGE_KEY = 'copywriter_history'
const MAX_ITEMS = 100

function generateId() {
  return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export function getHistory() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveHistory(list) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    // storage full — trim older half
    const half = list.slice(0, Math.floor(list.length / 2))
    try { uni.setStorageSync(STORAGE_KEY, JSON.stringify(half)) } catch (_) {}
  }
}

export function addRecord(topic, style, result, imageUrl) {
  const list = getHistory()
  list.unshift({
    id: generateId(),
    topic,
    style,
    imageUrl: imageUrl || '',
    result,
    isFavorite: false,
    createdAt: new Date().toISOString()
  })
  if (list.length > MAX_ITEMS) list.length = MAX_ITEMS
  saveHistory(list)
}

export function deleteRecord(id) {
  const list = getHistory().filter(item => item.id !== id)
  saveHistory(list)
}

export function toggleFavorite(id) {
  const list = getHistory()
  const item = list.find(item => item.id === id)
  if (item) {
    item.isFavorite = !item.isFavorite
    saveHistory(list)
  }
  return item ? item.isFavorite : false
}

export function getFavorites() {
  return getHistory().filter(item => item.isFavorite)
}
