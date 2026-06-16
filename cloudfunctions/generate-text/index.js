'use strict'

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

exports.main = async (event) => {
  const { topic, style } = event

  if (!topic || !style) {
    return { error: true, message: '主题和风格不能为空' }
  }

  // Input length validation
  if (topic.length > 200) {
    return { error: true, message: '主题不能超过200字' }
  }
  if (style.length > 20) {
    return { error: true, message: '风格参数无效' }
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
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的文案生成助手。只输出JSON，不要输出其他内容。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 2000
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('DashScope API error:', res.status, errData)
      return { error: true, message: 'AI 服务返回异常，请重试' }
    }

    const data = await res.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const raw = data.choices[0].message.content
      if (typeof raw !== 'string') {
        return { error: true, message: 'AI 服务返回异常，请重试' }
      }
      // Try to parse JSON from response (handle possible markdown wrapping)
      const jsonMatch = raw.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { result: parsed }
      }
      return { result: raw, error: true, message: 'JSON解析失败，返回原始内容' }
    }

    return { error: true, message: 'AI 服务返回异常，请重试' }

  } catch (e) {
    console.error('generate-text error:', e)
    return { error: true, message: '服务暂不可用，请稍后重试' }
  }
}
