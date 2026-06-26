// 30+ preset daily topics. Each day picks 3-5 based on date.
const TOPIC_POOL = [
  '今天吃了什么好吃的？',
  '追的剧太上头了怎么办',
  '周末去哪里玩',
  '最近入手的好物分享',
  '今日穿搭灵感',
  '和闺蜜的下午茶时光',
  '加班后的治愈瞬间',
  '健身打卡第N天',
  '新学的菜谱成功了吗',
  '旅行的意义是什么',
  '宅家的一天怎么过',
  '咖啡续命中',
  '下雨天的碎碎念',
  '深夜放毒时间',
  '我的桌面好物',
  '书店偶遇一本好书',
  '早起的第一缕阳光',
  '宠物日常大公开',
  '城市漫步发现的美好',
  '仪式感满满的早餐',
  '学习新技能中',
  '今天的心情是彩虹色',
  '季节交替的穿搭烦恼',
  '便利店美食大赏',
  '一个人也要好好吃饭',
  '收到了期待已久的快递',
  '最近单曲循环的歌',
  '拍到了满意的照片',
  '春天来了去哪里踏青',
  '毕业季的感悟',
  '换季护肤心得',
  '周末市集淘宝',
  '打卡网红店真实测评',
  '第一次尝试XXX',
  '治愈系日常碎片',
  '跨年倒计时',
  '节假日的仪式感',
  '年终总结与新年计划',
  '这个月的快乐源泉',
  '生活中的小确幸'
]

export function getDailyTopics(count = 4) {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const shuffled = [...TOPIC_POOL]
  // Deterministic shuffle based on day
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (dayOfYear * (i + 1) + i * 7) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}
