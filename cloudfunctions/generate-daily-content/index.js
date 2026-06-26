'use strict'

const https = require('https')

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const API_HOST = 'dashscope.aliyuncs.com'
const API_PATH = '/compatible-mode/v1/chat/completions'

function dashscopeRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const options = {
      hostname: API_HOST,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 60000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => { resolve({ status: res.statusCode, body: data }) })
    })

    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')) })
    req.on('error', (e) => { reject(e) })
    req.write(body)
    req.end()
  })
}

function extractJson(raw) {
  let text = raw.trim()
  // Attempt 1: direct parse
  try { return JSON.parse(text) } catch (_) {}
  // Attempt 2: strip markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch (_) {}
  }
  // Attempt 3: find outermost {...}
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    if (text[i] === '}') depth--
    if (depth === 0) {
      try { return JSON.parse(text.substring(start, i + 1)) } catch (_) { return null }
    }
  }
  return null
}

exports.main = async () => {
  if (!DASHSCOPE_API_KEY) {
    return { error: true, message: 'API Key 未配置' }
  }

  const prompt = `你是一个创意内容生成助手。请根据当前日期生成今天的社交媒体灵感内容。

请严格按以下JSON格式返回（不要输出任何其他内容，只输出JSON）：

{
  "fortune": {
    "level": "大吉/吉/中吉/小吉/末吉 中的一个",
    "icon": "对应emoji（🌟大吉 ✨吉 🍀中吉 🌸小吉 🌤️末吉）",
    "color": "十六进制颜色（#FF2D78大吉 #FF9500吉 #3ED4C4中吉 #B347FF小吉 #4A90D9末吉）",
    "desc": "一句今日运势描述，12字以内",
    "luckyColor": "一个颜色名称，2个字",
    "luckyNum": "0-9的数字",
    "advice": "今日宜：xxx，格式：今日宜：xxx"
  },
  "topics": ["话题1", "话题2", "话题3", "话题4"]
}

要求：
- 运势要多样，不要总是大吉
- 话题要接地气、贴近社交媒体日常，适合小红书/朋友圈风格
- 话题12字以内，有趣有共鸣
- 运势和话题都要每天不一样`

  let status, body
  try {
    const result = await dashscopeRequest({
      model: 'qwen-turbo',
      messages: [
        { role: 'system', content: '你是一个专业的创意内容助手。只输出JSON，不要输出其他内容。' },
        { role: 'user', content: prompt }
      ],
      temperature: 1.2,
      max_tokens: 800
    })
    status = result.status
    body = result.body
  } catch (e) {
    return { error: true, message: '网络请求失败: ' + e.message }
  }

  if (status !== 200) {
    return { error: true, message: 'API状态' + status + ': ' + body.substring(0, 100) }
  }

  let data
  try { data = JSON.parse(body) } catch (e) {
    return { error: true, message: '解析响应失败: ' + body.substring(0, 100) }
  }

  const raw = data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : null
  if (!raw || typeof raw !== 'string') {
    return { error: true, message: '响应结构异常' }
  }

  const parsed = extractJson(raw)
  if (!parsed) {
    return { error: true, message: 'AI输出格式解析失败: ' + raw.substring(0, 100) }
  }

  return { result: parsed }
}
