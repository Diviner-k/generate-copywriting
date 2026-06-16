# 文案大师 - Design Spec

**Date:** 2026-06-16
**Version:** V1 MVP

---

## 1. Product Overview

A WeChat Mini Program that generates social media copy (小红书文案 + 朋友圈文案) using AI. Users input a topic, select a style, and get copy-paste-ready content.

### MVP Scope

- Text generation: 小红书 (title + body + tags) + 朋友圈 (3 short versions)
- 5 style options: 高级感, 种草, emo, 可爱, 幽默
- One-click copy for each output block
- No database, no history, no payments, no template library

---

## 2. Architecture

```
User Input (topic + style)
       ↓
  UniApp Frontend (Vue)
       ↓
  wx.cloud.callFunction("generate-text")
       ↓
  CloudBase Cloud Function (Node.js)
       ↓
  通义千问 API (qwen-turbo, OpenAI-compatible mode)
       ↓
  JSON result → parsed → rendered on result page
```

### Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | UniApp (Vue 2/3) | Fast dev, cross-platform potential |
| Backend | 微信云开发 CloudBase | Zero extra registration, auto openid |
| AI | 通义千问 qwen-turbo | Cheap, stable domestic access, free tier |

---

## 3. Project Structure

```
project/
├── pages/
│   ├── index/              # Input page
│   └── result/             # Result page
├── components/
│   └── StyleSelect.vue     # Style picker component
├── cloudfunctions/
│   └── generate-text/      # AI generation cloud function
│       ├── index.js
│       └── package.json
├── static/                 # Icons, images
├── App.vue
├── main.js
├── manifest.json
├── pages.json
└── project.config.json     # WeChat Mini Program config
```

---

## 4. Pages & Components

### 4.1 Input Page (`pages/index`)

**Layout:**
- Title: "文案大师" + subtitle "让文案自带传播力"
- Textarea for topic input, placeholder: "今天吃了火锅..."
- Horizontal scrollable style cards (5 options)
- Gradient purple generate button, disabled when input is empty

**Style options with icons:**
| Style | Icon |
|-------|------|
| 高级感 | ✨ |
| 种草 | 🌿 |
| emo | 😢 |
| 可爱 | 🎀 |
| 幽默 | 😂 |

**States:**
- Empty input → button disabled (grey)
- Has input → button active (purple gradient)
- Generating → button shows loading spinner + "生成中..."
- Error → toast with error message

### 4.2 Result Page (`pages/result`)

**Layout:**
- Navigation bar with back button + title "结果"
- 小红书 section: card with title, content, tags, copy button
- 朋友圈 section: card with 3 items, each with copy button
- "重新生成" button at bottom

**Data flow:** Receive result string via `uni.navigateTo` URL params (or global state), parse and render.

### 4.3 StyleSelect Component

**Props:** `{ icon: string, label: string, selected: boolean }`
**Events:** `@select`
**Visual:** Card with icon + label, purple highlight when selected, grey when not.

---

## 5. Cloud Function: `generate-text`

### Input
```json
{
  "topic": "今天吃了火锅",
  "style": "种草"
}
```

### Prompt Template
```
你是一个小红书和朋友圈文案专家。

主题：${topic}
风格：${style}

请严格按以下 JSON 格式返回（不要输出其他内容）：

{
  "xiaohongshu": {
    "title": "标题",
    "content": "正文",
    "tags": ["#tag1", "#tag2", "#tag3"]
  },
  "pengyouquan": ["文案1", "文案2", "文案3"]
}
```

### API Call
- Endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- Model: `qwen-turbo`
- Auth: `Bearer ${DASHSCOPE_API_KEY}` (environment variable)
- Timeout: 30 seconds

### Error Handling
- API timeout → `{ error: true, message: "生成失败，请重试" }`
- Invalid JSON response → try-catch, return raw text as fallback
- Network failure → `{ error: true, message: "服务暂不可用" }`

### Output
```json
{
  "result": {
    "xiaohongshu": {
      "title": "...",
      "content": "...",
      "tags": ["...", "...", "..."]
    },
    "pengyouquan": ["...", "...", "..."]
  }
}
```

---

## 6. UI Specifications

### Colors
| Role | Value |
|------|-------|
| Primary (button, selected) | `#7C3AED` |
| Primary light (card bg) | `#F5F3FF` |
| Gradient (button) | `#7C3AED` → `#A855F7` |
| Text primary | `#1F2937` |
| Text secondary | `#9CA3AF` |
| Page background | `#FAFAFA` |
| Card white | `#FFFFFF` |

### Dimensions
| Element | Value |
|---------|-------|
| Card border-radius | 16rpx |
| Button border-radius | 50rpx (capsule) |
| Button height | 96rpx |
| Card shadow | `0 2rpx 12rpx rgba(0,0,0,0.06)` |
| Title font | bold 36rpx |
| Body font | 28rpx |
| Caption font | 24rpx |

---

## 7. Out of Scope (V2+)

- User login page (CloudBase handles openid automatically)
- Database / history records
- Payment / subscription system
- Template library
- Favorites
- AI rewrite arbitrary text
- User-submitted templates

---

## 8. Deployment

1. `npm create uni-app` → WeChat Mini Program template
2. Fill in AppID in `project.config.json`
3. Write code
4. Open in 微信开发者工具 → Cloud Development → Enable → Upload cloud function
5. Set `DASHSCOPE_API_KEY` in CloudBase console environment variables
6. Preview → test on device → upload → submit for review
