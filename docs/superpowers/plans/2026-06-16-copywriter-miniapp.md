# 文案大师 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program that generates 小红书 + 朋友圈 copy via AI, with 5 style options and one-click copy.

**Architecture:** UniApp (Vue) frontend → `wx.cloud.callFunction()` → CloudBase cloud function → 通义千问 qwen-turbo API → parse JSON response → render result. Two pages (input + result), one reusable component, one cloud function.

**Tech Stack:** UniApp (Vue 2), 微信云开发 CloudBase, 通义千问 qwen-turbo, Node.js cloud function

---

## File Map

| File | Responsibility |
|------|---------------|
| `project.config.json` | WeChat Mini Program AppID + cloud function root |
| `manifest.json` | UniApp project manifest |
| `pages.json` | Page routes, navigation config |
| `main.js` | App entry, CloudBase init |
| `App.vue` | Root component, global styles |
| `pages/index/index.vue` | Topic input + style selection + generate trigger |
| `pages/result/result.vue` | Render 小红书/朋友圈 results + copy buttons |
| `components/StyleSelect.vue` | Single style card (icon + label + selected state) |
| `cloudfunctions/generate-text/index.js` | AI API call + JSON parsing |
| `cloudfunctions/generate-text/package.json` | Cloud function dependencies |

---

### Task 1: Scaffold Project

**Files:**
- Create: `project.config.json`
- Create: `manifest.json`
- Create: `pages.json`
- Create: `main.js`
- Create: `App.vue`

- [ ] **Step 1: Create `project.config.json`**

```json
{
  "miniprogramRoot": "dist/dev/mp-weixin/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "postcss": true,
    "minified": true
  },
  "appid": "你的小程序AppID",
  "projectname": "文案大师",
  "condition": {}
}
```

- [ ] **Step 2: Create `manifest.json`**

```json
{
  "name": "文案大师",
  "appid": "__UNI__UNIAPP_PROJECT",
  "description": "AI 文案生成工具",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "mp-weixin": {
    "appid": "你的小程序AppID",
    "setting": {
      "urlCheck": true
    },
    "cloudfunctionRoot": "cloudfunctions/"
  }
}
```

- [ ] **Step 3: Create `pages.json`**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "文案大师"
      }
    },
    {
      "path": "pages/result/result",
      "style": {
        "navigationBarTitleText": "生成结果"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "文案大师",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#FAFAFA"
  }
}
```

- [ ] **Step 4: Create `main.js`**

```javascript
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
```

- [ ] **Step 5: Create `App.vue`**

```html
<script>
export default {
  onLaunch() {
    wx.cloud.init({
      env: '你的云环境ID',
      traceUser: true
    })
  }
}
</script>

<style>
page {
  background-color: #FAFAFA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1F2937;
  font-size: 28rpx;
}
</style>
```

- [ ] **Step 6: Verify scaffold**

Run: Open project directory in 微信开发者工具
Expected: Project compiles, shows blank white screen, no console errors

- [ ] **Step 7: Commit**

```bash
git add project.config.json manifest.json pages.json main.js App.vue
git commit -m "feat: scaffold UniApp project structure"
```

---

### Task 2: StyleSelect Component

**Files:**
- Create: `components/StyleSelect.vue`

- [ ] **Step 1: Create `components/StyleSelect.vue`**

```html
<template>
  <view
    class="style-card"
    :class="{ 'style-card--selected': selected }"
    @click="$emit('select')"
  >
    <text class="style-card__icon">{{ icon }}</text>
    <text class="style-card__label">{{ label }}</text>
  </view>
</template>

<script>
export default {
  name: 'StyleSelect',
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    selected: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.style-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #FFFFFF;
  margin-right: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.style-card--selected {
  background: #F5F3FF;
  border: 2rpx solid #7C3AED;
}
.style-card__icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}
.style-card__label {
  font-size: 24rpx;
  color: #1F2937;
}
.style-card--selected .style-card__label {
  color: #7C3AED;
  font-weight: bold;
}
</style>
```

- [ ] **Step 2: Verify**

Run: Check file exists at `components/StyleSelect.vue`
Expected: File created with template, script, and scoped styles

- [ ] **Step 3: Commit**

```bash
git add components/StyleSelect.vue
git commit -m "feat: add StyleSelect component"
```

---

### Task 3: Input Page

**Files:**
- Create: `pages/index/index.vue`

- [ ] **Step 1: Create `pages/index/index.vue`**

```html
<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="header__title">文案大师</text>
      <text class="header__subtitle">让文案自带传播力</text>
    </view>

    <!-- Input -->
    <view class="input-section">
      <textarea
        class="input-section__textarea"
        v-model="topic"
        placeholder="输入你想写的内容，比如：今天吃了火锅..."
        placeholder-style="color: #9CA3AF"
        maxlength="200"
      />
    </view>

    <!-- Style Selection -->
    <view class="style-section">
      <text class="style-section__label">选择风格</text>
      <scroll-view class="style-section__list" scroll-x>
        <StyleSelect
          v-for="s in styles"
          :key="s.value"
          :icon="s.icon"
          :label="s.label"
          :selected="selectedStyle === s.value"
          @select="selectedStyle = s.value"
        />
      </scroll-view>
    </view>

    <!-- Generate Button -->
    <view class="action">
      <button
        class="action__btn"
        :class="{ 'action__btn--disabled': !canGenerate }"
        :disabled="!canGenerate || loading"
        @click="generate"
      >
        {{ loading ? '生成中...' : '✨ 生成文案' }}
      </button>
    </view>
  </view>
</template>

<script>
import StyleSelect from '@/components/StyleSelect.vue'

export default {
  components: { StyleSelect },
  data() {
    return {
      topic: '',
      selectedStyle: '',
      loading: false,
      styles: [
        { value: '高级感', label: '高级感', icon: '✨' },
        { value: '种草', label: '种草', icon: '🌿' },
        { value: 'emo', label: 'emo', icon: '😢' },
        { value: '可爱', label: '可爱', icon: '🎀' },
        { value: '幽默', label: '幽默', icon: '😂' }
      ]
    }
  },
  computed: {
    canGenerate() {
      return this.topic.trim() && this.selectedStyle
    }
  },
  methods: {
    async generate() {
      if (!this.canGenerate || this.loading) return
      this.loading = true
      try {
        const res = await wx.cloud.callFunction({
          name: 'generate-text',
          data: {
            topic: this.topic.trim(),
            style: this.selectedStyle
          }
        })
        const data = res.result
        if (data.error) {
          uni.showToast({ title: data.message, icon: 'none' })
          return
        }
        uni.navigateTo({
          url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(data.result))
        })
      } catch (e) {
        uni.showToast({ title: '生成失败，请重试', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  padding: 48rpx 32rpx;
}
.header {
  margin-bottom: 48rpx;
}
.header__title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8rpx;
}
.header__subtitle {
  font-size: 28rpx;
  color: #9CA3AF;
}
.input-section {
  margin-bottom: 32rpx;
}
.input-section__textarea {
  width: 100%;
  height: 200rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1F2937;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.style-section {
  margin-bottom: 48rpx;
}
.style-section__label {
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 16rpx;
  display: block;
}
.style-section__list {
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}
.action {
  display: flex;
  justify-content: center;
}
.action__btn {
  width: 100%;
  height: 96rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action__btn--disabled {
  background: #D1D5DB;
  color: #9CA3AF;
}
</style>
```

- [ ] **Step 2: Verify**

Run: Open 微信开发者工具, navigate to index page
Expected: Shows header, textarea, 5 style cards in horizontal scroll, disabled grey button

- [ ] **Step 3: Commit**

```bash
git add pages/index/index.vue
git commit -m "feat: add input page with topic and style selection"
```

---

### Task 4: Result Page

**Files:**
- Create: `pages/result/result.vue`

- [ ] **Step 1: Create `pages/result/result.vue`**

```html
<template>
  <view class="page">
    <!-- 小红书 Section -->
    <view class="section">
      <text class="section__title">📕 小红书文案</text>
      <view class="card">
        <text class="card__label">标题</text>
        <text class="card__text card__text--title">{{ result.xiaohongshu.title }}</text>

        <text class="card__label">正文</text>
        <text class="card__text">{{ result.xiaohongshu.content }}</text>

        <view class="card__tags">
          <text v-for="(tag, i) in result.xiaohongshu.tags" :key="i" class="card__tag">{{ tag }}</text>
        </view>

        <view class="card__copy" @click="copyXiaohongshu">
          <text class="card__copy-text">一键复制</text>
        </view>
      </view>
    </view>

    <!-- 朋友圈 Section -->
    <view class="section">
      <text class="section__title">💬 朋友圈文案</text>
      <view class="card">
        <view
          v-for="(item, i) in result.pengyouquan"
          :key="i"
          class="pyq-item"
        >
          <text class="pyq-item__index">{{ i + 1 }}.</text>
          <text class="pyq-item__text">{{ item }}</text>
          <text class="pyq-item__copy" @click="copyText(item)">复制</text>
        </view>
      </view>
    </view>

    <!-- Regenerate -->
    <view class="action">
      <button class="action__btn" @click="goBack">
        🔄 重新生成
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      result: {
        xiaohongshu: { title: '', content: '', tags: [] },
        pengyouquan: []
      }
    }
  },
  onLoad(options) {
    try {
      this.result = JSON.parse(decodeURIComponent(options.data))
    } catch (e) {
      uni.showToast({ title: '数据解析失败', icon: 'none' })
    }
  },
  methods: {
    copyXiaohongshu() {
      const text = [
        this.result.xiaohongshu.title,
        '',
        this.result.xiaohongshu.content,
        '',
        this.result.xiaohongshu.tags.join(' ')
      ].join('\n')
      this.copyText(text)
    },
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  padding: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section__title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
  display: block;
  margin-bottom: 16rpx;
}
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.card__label {
  font-size: 24rpx;
  color: #9CA3AF;
  display: block;
  margin-bottom: 4rpx;
  margin-top: 16rpx;
}
.card__label:first-child {
  margin-top: 0;
}
.card__text {
  font-size: 28rpx;
  color: #1F2937;
  line-height: 1.6;
  display: block;
}
.card__text--title {
  font-size: 32rpx;
  font-weight: bold;
}
.card__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}
.card__tag {
  color: #7C3AED;
  font-size: 22rpx;
  margin-right: 12rpx;
  line-height: 1.8;
}
.card__copy {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}
.card__copy-text {
  color: #7C3AED;
  font-size: 26rpx;
  font-weight: bold;
}
.pyq-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F3F4F6;
}
.pyq-item:last-child {
  border-bottom: none;
}
.pyq-item__index {
  color: #9CA3AF;
  font-size: 26rpx;
  width: 40rpx;
  flex-shrink: 0;
}
.pyq-item__text {
  flex: 1;
  font-size: 28rpx;
  color: #1F2937;
  line-height: 1.6;
}
.pyq-item__copy {
  color: #7C3AED;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.action {
  margin-top: 16rpx;
  display: flex;
  justify-content: center;
}
.action__btn {
  width: 100%;
  height: 96rpx;
  border-radius: 50rpx;
  background: #FFFFFF;
  color: #7C3AED;
  font-size: 32rpx;
  font-weight: bold;
  border: 2rpx solid #7C3AED;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

- [ ] **Step 2: Verify**

Run: Open 微信开发者工具, input topic + style → tap generate
Expected: Navigates to result page, shows 小红书 card + 朋友圈 list, copy buttons respond

- [ ] **Step 3: Commit**

```bash
git add pages/result/result.vue
git commit -m "feat: add result page with copy and regenerate"
```

---

### Task 5: Cloud Function

**Files:**
- Create: `cloudfunctions/generate-text/package.json`
- Create: `cloudfunctions/generate-text/index.js`

- [ ] **Step 1: Create `cloudfunctions/generate-text/package.json`**

```json
{
  "name": "generate-text",
  "version": "1.0.0",
  "description": "AI copywriter cloud function",
  "main": "index.js",
  "dependencies": {}
}
```

- [ ] **Step 2: Create `cloudfunctions/generate-text/index.js`**

```javascript
'use strict'

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

exports.main = async (event) => {
  const { topic, style } = event

  if (!topic || !style) {
    return { error: true, message: '主题和风格不能为空' }
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

    const data = await res.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const raw = data.choices[0].message.content
      // Try to parse JSON from response (handle possible markdown wrapping)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
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
```

- [ ] **Step 3: Test locally (optional)**

Run: In terminal, simulate the function call with mock data
```bash
# Test the prompt logic by manually checking the JSON structure
node -e "
const fn = require('./cloudfunctions/generate-text/index.js');
console.log('Function loaded successfully');
"
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/generate-text/
git commit -m "feat: add generate-text cloud function with qwen-turbo"
```

---

### Task 6: Deployment & End-to-End Test

- [ ] **Step 1: Install CloudBase deps in cloud function**

```bash
cd cloudfunctions/generate-text && npm install
```

- [ ] **Step 2: Upload cloud function**

In 微信开发者工具: Right-click `cloudfunctions/generate-text` → "上传并部署：云端安装依赖"

- [ ] **Step 3: Set environment variable**

In CloudBase console → 云函数 → generate-text → 环境变量:
```
DASHSCOPE_API_KEY = sk-xxxxx（你的通义千问API Key）
```

- [ ] **Step 4: Fill in real AppID**

Replace `你的小程序AppID` with actual AppID in:
- `project.config.json`
- `manifest.json`

- [ ] **Step 5: Fill in CloudBase env ID**

Replace `你的云环境ID` with actual env ID in:
- `App.vue` (the `wx.cloud.init({ env: '...' })` call)

- [ ] **Step 6: End-to-end test**

In 微信开发者工具 → Preview on device:
1. Open app → see input page with header, textarea, 5 style cards
2. Enter topic "今天吃了火锅" → select "种草" style → tap "生成文案"
3. Wait for loading → see result page with 小红书 card + 朋友圈 list
4. Tap "一键复制" → confirm toast "已复制"
5. Tap "复制" on individual 朋友圈 item → confirm toast
6. Tap "重新生成" → return to input page

- [ ] **Step 7: Commit final config**

```bash
git add .
git commit -m "chore: finalize deployment config"
```

---

## Manual Testing Checklist (Post-Deployment)

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Empty input → tap generate | Button is grey, disabled |
| 2 | Input text but no style selected → tap | Button is grey, disabled |
| 3 | Input + style → generate | Loading state, navigate to result |
| 4 | Result page shows 小红书 title/content/tags | All present |
| 5 | Result page shows 3 朋友圈 items | 3 items, each with copy |
| 6 | Tap "一键复制" on 小红书 | Toast "已复制", clipboard has full text |
| 7 | Tap "复制" on single 朋友圈 | Toast "已复制", clipboard has that item |
| 8 | Tap "重新生成" | Navigate back to input page |
| 9 | Kill network → generate | Toast "生成失败，请重试" or "服务暂不可用" |
| 10 | Very long input (>200 chars) | Maxlength prevents input |
