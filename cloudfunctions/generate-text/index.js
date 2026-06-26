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

exports.main = async (event) => {
  const { topic, style, imageUrl } = event

  // Step 1: validate inputs
  if (!topic || !style) {
    return { error: true, message: '主题和风格不能为空' }
  }
  if (topic.length > 200) {
    return { error: true, message: '主题不能超过200字' }
  }
  if (style.length > 20) {
    return { error: true, message: '风格参数无效' }
  }

  // Step 2: check API key
  if (!DASHSCOPE_API_KEY) {
    return { error: true, message: 'API Key 未配置' }
  }

  const hasImage = !!(imageUrl && typeof imageUrl === 'string' && imageUrl.trim())

  // Step 3: build prompt
  let prompt, model, messages
  try {
    prompt = `你是一个小红书和朋友圈文案专家。请根据以下要求生成文案：

主题：${topic}
风格：${style}${hasImage ? '\n注意：用户提供了一张图片，请结合图片内容来生成文案。' : ''}

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

    if (hasImage) {
      model = 'qwen-vl-plus'
      messages = [
        { role: 'system', content: '你是一个专业的文案生成助手。只输出JSON，不要输出其他内容。' },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: imageUrl.trim() } },
          { type: 'text', text: prompt }
        ]}
      ]
    } else {
      model = 'qwen-turbo'
      messages = [
        { role: 'system', content: '你是一个专业的文案生成助手。只输出JSON，不要输出其他内容。' },
        { role: 'user', content: prompt }
      ]
    }
  } catch (e) {
    return { error: true, message: `Step3-构建prompt失败: ${e.message}` }
  }

  // Step 4: call API
  let status, body
  try {
    const result = await dashscopeRequest({
      model: model,
      messages: messages,
      temperature: 0.9,
      max_tokens: 2000
    })
    status = result.status
    body = result.body
  } catch (e) {
    return { error: true, message: `Step4-网络请求失败: ${e.message}` }
  }

  // Step 5: check status
  if (status !== 200) {
    if (status === 401 || status === 403) {
      return { error: true, message: 'API Key 无效，请检查' }
    }
    return { error: true, message: `Step5-API状态${status}: ${body.substring(0, 100)}` }
  }

  // Step 6: parse response JSON
  let data
  try {
    data = JSON.parse(body)
  } catch (e) {
    return { error: true, message: `Step6-解析响应失败: ${body.substring(0, 100)}` }
  }

  // Step 7: extract AI content
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    return { error: true, message: `Step7-响应结构异常: ${JSON.stringify(data).substring(0, 200)}` }
  }

  const raw = data.choices[0].message.content
  if (typeof raw !== 'string') {
    return { error: true, message: 'Step7-content不是字符串' }
  }

  // Step 8: extract JSON from AI response
  let parsed
  try {
    let text = raw.trim()

    // Attempt 1: parse entire content as JSON
    try { parsed = JSON.parse(text); return { result: parsed } } catch (_) {}

    // Attempt 2: strip markdown code fences, try again
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      try { parsed = JSON.parse(fenceMatch[1].trim()); return { result: parsed } } catch (_) {}
    }

    // Attempt 3: find outermost balanced {...}
    const start = text.indexOf('{')
    if (start === -1) {
      return { error: true, message: `Step8-未找到JSON: ${raw.substring(0, 100)}` }
    }
    let depth = 0
    let end = -1
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++
      if (text[i] === '}') depth--
      if (depth === 0) { end = i; break }
    }
    if (end === -1) {
      return { error: true, message: `Step8-JSON括号不匹配: ${raw.substring(0, 100)}` }
    }
    parsed = JSON.parse(text.substring(start, end + 1))
  } catch (e) {
    return { error: true, message: `Step8-解析AI输出失败: ${e.message}` }
  }

  // Success!
  return { result: parsed }
}
