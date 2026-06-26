// Daily fortune generator — deterministic based on date
const FORTUNES = [
  { level: '大吉', icon: '🌟', color: '#FF2D78', desc: '今天创意爆棚，适合大胆表达', luckyColor: '粉色', luckyNum: 7 },
  { level: '大吉', icon: '🌟', color: '#FF2D78', desc: '灵感如泉涌，写什么都出彩', luckyColor: '红色', luckyNum: 9 },
  { level: '吉', icon: '✨', color: '#FF9500', desc: '心情不错，适合记录美好瞬间', luckyColor: '橙色', luckyNum: 3 },
  { level: '吉', icon: '✨', color: '#FF9500', desc: '小确幸满满，分享给朋友吧', luckyColor: '黄色', luckyNum: 6 },
  { level: '中吉', icon: '🍀', color: '#3ED4C4', desc: '稳扎稳打的一天，平平淡淡才是真', luckyColor: '绿色', luckyNum: 5 },
  { level: '中吉', icon: '🍀', color: '#3ED4C4', desc: '适合静下心来，好好犒劳自己', luckyColor: '蓝色', luckyNum: 2 },
  { level: '小吉', icon: '🌸', color: '#B347FF', desc: '温柔的一天，给自己多一点耐心', luckyColor: '紫色', luckyNum: 8 },
  { level: '小吉', icon: '🌸', color: '#B347FF', desc: '慢下来，发现身边的小美好', luckyColor: '白色', luckyNum: 4 },
  { level: '末吉', icon: '🌤️', color: '#4A90D9', desc: '保持平常心，好事即将发生', luckyColor: '灰色', luckyNum: 1 },
  { level: '末吉', icon: '🌤️', color: '#4A90D9', desc: '小小的波折是生活的调味剂', luckyColor: '棕色', luckyNum: 0 },
]

const ADVICE = [
  '💡 今日宜：发朋友圈、自拍、吃好吃的',
  '💡 今日宜：追剧、喝奶茶、收快递',
  '💡 今日宜：学习新技能、出门走走',
  '💡 今日宜：整理房间、约朋友见面',
  '💡 今日宜：大胆尝试、突破舒适圈',
  '💡 今日宜：听听音乐、写写日记',
  '💡 今日宜：买个小礼物送给自己',
  '💡 今日宜：做个新发型、换种心情',
]

export function getTodayFortune() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  // Use a simple hash for deterministic selection
  const hash = (seed * 2654435761) >>> 0
  const fortuneIdx = hash % FORTUNES.length
  const adviceIdx = (hash * 7 + 3) % ADVICE.length

  return {
    ...FORTUNES[fortuneIdx],
    advice: ADVICE[adviceIdx]
  }
}
