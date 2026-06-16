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
      timeout: 30000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data })
      })
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('请求超时'))
    })

    req.on('error', (e) => {
      reject(e)
    })

    req.write(body)
    req.end()
  })
}

exports.main = async (event) => {
  const { topic, style } = event

  if (!topic || !style) {
    return { error: true, message: '主题和风格不能为空' }
  }

  if (topic.length > 200) {
    return { error: true, message: '主题不能超过200字' }
  }
  if (style.length > 20) {
    return { error: true, message: '风格参数无效' }
  }

  if (!DASHSCOPE_API_KEY) {
    return { error: true, message: 'API Key 未配置，请在云函数环境变量中设置 DASHSCOPE_API_KEY' }
  }

  const prompt = `你是一个小红书和朋友圈文案专家。请根据以下要求生成文案：

主题：${topic}
风格：${style}

要求：
- 口语化、有情绪、易传播
- 小红书文案包含吸睛标题 + 正文 + 3-5个tags
- 朋友圈文案生成3条不同风格的短文案

请严格按以下JSON格式返回（不要输出其他任何内容，只输出JSON）：

{
  "xiaohongshu": {
    "title": "小红书标题",
    "content": "小红书正文内容",
    "tags": ["#tag1", "#tag2", "#tag3"]
  },
  "pengyouquan": ["朋友圈文案1", "朋友圈文案2", "朋友圈文案3"]
}`

  try {
    const { status, body } = await dashscopeRequest({
      model: 'qwen-turbo',
      messages: [
        { role: 'system', content: '你是一个专业的文案生成助手。只输出JSON，不要输出其他内容。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 2000
    })

    if (status !== 200) {
      console.error('DashScope API error:', status, body.substring(0, 500))
      if (status === 401 || status === 403) {
        return { error: true, message: 'API Key 无效，请检查 DASHSCOPE_API_KEY' }
      }
      return { error: true, message: `AI 服务错误(${status})，请重试` }
    }

    let data
    try {
      data = JSON.parse(body)
    } catch (e) {
      return { error: true, message: `AI 返回非 JSON：${body.substring(0, 80)}` }
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const raw = data.choices[0].message.content
      if (typeof raw !== 'string') {
        return { error: true, message: 'AI 返回格式异常，请重试' }
      }
      const jsonMatch = raw.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { result: parsed }
      }
      return { error: true, message: '生成结果解析失败，请重试' }
    }

    return { error: true, message: 'AI 服务返回异常，请重试' }

  } catch (e) {
    console.error('generate-text error:', e.message || e)
    return { error: true, message: `服务暂不可用：${e.message || '未知错误'}` }
  }
}
