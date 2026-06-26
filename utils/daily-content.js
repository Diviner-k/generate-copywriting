// Daily content — AI-generated fortune + topics with localStorage cache
// Falls back to hardcoded data if API fails

const CACHE_KEY = 'daily_content_cache'
const CACHE_DATE_KEY = 'daily_content_date'

// ── Hardcoded fallbacks ──

const FALLBACK_FORTUNES = [
  { level: '大吉', icon: '🌟', color: '#FF2D78', desc: '今天创意爆棚，适合大胆表达', luckyColor: '粉色', luckyNum: 7, advice: '💡 今日宜：发朋友圈、自拍、吃好吃的' },
  { level: '吉', icon: '✨', color: '#FF9500', desc: '心情不错，适合记录美好瞬间', luckyColor: '橙色', luckyNum: 3, advice: '💡 今日宜：追剧、喝奶茶、收快递' },
  { level: '中吉', icon: '🍀', color: '#3ED4C4', desc: '稳扎稳打的一天，平平淡淡才是真', luckyColor: '绿色', luckyNum: 5, advice: '💡 今日宜：学习新技能、出门走走' },
  { level: '小吉', icon: '🌸', color: '#B347FF', desc: '温柔的一天，给自己多一点耐心', luckyColor: '紫色', luckyNum: 8, advice: '💡 今日宜：听听音乐、写写日记' },
]

const FALLBACK_TOPICS = [
  '今天吃了什么好吃的？', '追的剧太上头了怎么办', '周末去哪里玩',
  '最近入手的好物分享', '今日穿搭灵感', '和闺蜜的下午茶时光',
  '加班后的治愈瞬间', '健身打卡第N天', '新学的菜谱成功了吗',
  '旅行的意义是什么', '宅家的一天怎么过', '咖啡续命中',
]

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function pickFallback(list, count, seed) {
  const shuffled = [...list]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) + i * 7) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

function getCached() {
  try {
    const date = uni.getStorageSync(CACHE_DATE_KEY)
    if (date === getTodayKey()) {
      const raw = uni.getStorageSync(CACHE_KEY)
      return raw ? JSON.parse(raw) : null
    }
  } catch (_) {}
  return null
}

function setCache(data) {
  try {
    uni.setStorageSync(CACHE_DATE_KEY, getTodayKey())
    uni.setStorageSync(CACHE_KEY, JSON.stringify(data))
  } catch (_) {}
}

async function fetchFromCloud() {
  try {
    const res = await wx.cloud.callFunction({ name: 'generate-daily-content' })
    const d = res.result
    if (d.error || !d.result) return null
    return d.result
  } catch (_) {
    return null
  }
}

function getFallback() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const hash = (seed * 2654435761) >>> 0
  return {
    fortune: FALLBACK_FORTUNES[hash % FALLBACK_FORTUNES.length],
    topics: pickFallback(FALLBACK_TOPICS, 4, hash)
  }
}

export async function getDailyContent() {
  // 1. Return cached if valid for today
  const cached = getCached()
  if (cached) return cached

  // 2. Try cloud function
  const aiResult = await fetchFromCloud()
  if (aiResult && aiResult.fortune && aiResult.topics && aiResult.topics.length > 0) {
    // Validate and normalize AI result
    const normalized = {
      fortune: {
        level: aiResult.fortune.level || '吉',
        icon: aiResult.fortune.icon || '✨',
        color: aiResult.fortune.color || '#FF9500',
        desc: aiResult.fortune.desc || '今天是个好日子',
        luckyColor: aiResult.fortune.luckyColor || '红色',
        luckyNum: typeof aiResult.fortune.luckyNum === 'number' ? aiResult.fortune.luckyNum : 3,
        advice: aiResult.fortune.advice || '今日宜：保持好心情'
      },
      topics: aiResult.topics.slice(0, 4).map(t => typeof t === 'string' ? t.slice(0, 16) : '')
    }
    setCache(normalized)
    return normalized
  }

  // 3. Fallback to hardcoded
  return getFallback()
}
