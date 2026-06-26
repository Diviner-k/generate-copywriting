<template>
  <view class="page">
    <!-- Error State -->
    <view v-if="hasError" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__text">数据加载失败</text>
      <view class="error-state__btn" @click="goBack">
        <text class="error-state__btn-text">🔄 返回重试</text>
      </view>
    </view>

    <!-- Normal Content -->
    <template v-else>
      <!-- Celebration Header -->
      <view class="header">
        <text class="header__title">🎉 文案生成好啦</text>
        <view class="header__underline"></view>
      </view>

      <!-- Image preview (if provided) -->
      <view v-if="imageUrl" class="image-preview">
        <image class="image-preview__img" :src="imageUrl" mode="aspectFill" @click="previewImage" />
        <text class="image-preview__label">📷 参考图片</text>
      </view>

      <!-- 小红书 Section -->
      <view class="section section--xiaohongshu">
        <view class="section__head">
          <view class="section__dot section__dot--pink"></view>
          <text class="section__title">📕 小红书文案</text>
        </view>
        <view class="card card--xiaohongshu">
          <text class="card__label">💡 标题</text>
          <text class="card__text card__text--title">{{ result.xiaohongshu.title }}</text>

          <text class="card__label">📝 正文</text>
          <text class="card__text">{{ result.xiaohongshu.content }}</text>

          <view class="card__tags">
            <text
              v-for="(tag, i) in result.xiaohongshu.tags"
              :key="i"
              class="card__tag"
              :style="{ backgroundColor: tagColor(i) }"
            >{{ tag }}</text>
          </view>

          <view class="card__copy" @click="copyXiaohongshu">
            <text class="card__copy-text">📋 一键复制</text>
          </view>
        </view>
      </view>

      <!-- 朋友圈 Section -->
      <view class="section section--pengyouquan">
        <view class="section__head">
          <view class="section__dot section__dot--coral"></view>
          <text class="section__title">💬 朋友圈文案</text>
        </view>
        <view class="card card--pengyouquan">
          <view
            v-for="(item, i) in result.pengyouquan"
            :key="i"
            class="pyq-item"
            :class="{ 'pyq-item--last': i === result.pengyouquan.length - 1 }"
          >
            <view class="pyq-item__num" :style="{ backgroundColor: numColor(i) }">
              <text class="pyq-item__num-text">{{ i + 1 }}</text>
            </view>
            <text class="pyq-item__text">{{ item }}</text>
            <view class="pyq-item__copy" @click="copyText(item)">
              <text class="pyq-item__copy-text">复制</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Action Buttons -->
      <view class="actions">
        <view class="action__rainbow" @click="shareCard">
          <view class="action__btn">
            <text class="action__btn-text">🖼️ 生成精美卡片 · 分享</text>
          </view>
        </view>
        <view class="actions__row">
          <view class="actions__fav" :class="{ 'actions__fav--active': isFavorited }" @click="toggleFav">
            <text>{{ isFavorited ? '⭐ 已收藏' : '🤍 收藏' }}</text>
          </view>
          <view class="actions__regenerate" @click="regenerate">
            <text>🔄 再生成一条</text>
          </view>
        </view>
        <view class="actions__back" @click="goBack">
          <text class="actions__back-text">🏠 返回首页</text>
        </view>
      </view>
    </template>

    <ShareCard ref="shareCard" />
  </view>
</template>

<script>
import { addRecord, toggleFavorite, getHistory } from '@/utils/storage.js'
import ShareCard from '@/components/ShareCard.vue'

export default {
  components: { ShareCard },
  data() {
    return {
      hasError: false,
      regenerating: false,
      topic: '',
      style: '',
      imageUrl: '',
      isFavorited: false,
      recordId: '',
      result: {
        xiaohongshu: { title: '', content: '', tags: [] },
        pengyouquan: []
      },
      tagColors: ['#171717', '#00ac96', '#4d4d4d', '#00927f', '#8f8f8f']
    }
  },
  onLoad(options) {
    try {
      const parsed = JSON.parse(decodeURIComponent(options.data))
      this.result = {
        xiaohongshu: { title: '', content: '', tags: [], ...(parsed.xiaohongshu || {}) },
        pengyouquan: parsed.pengyouquan || []
      }
    } catch (e) {
      this.hasError = true
      uni.showToast({ title: '数据解析失败', icon: 'none' })
      return
    }
    // 保存主题和风格，用于重新生成
    this.topic = decodeURIComponent(options.topic || '')
    this.style = decodeURIComponent(options.style || '')
    // 保存图片链接（选填）
    this.imageUrl = decodeURIComponent(options.imageUrl || '')

    // 自动保存到历史记录
    this.saveToHistory()
  },
  methods: {
    async regenerate() {
      if (this.regenerating || !this.topic || !this.style) return
      this.regenerating = true
      try {
        const res = await wx.cloud.callFunction({
          name: 'generate-text',
          data: {
            topic: this.topic,
            style: this.style,
            imageUrl: this.imageUrl || undefined
          }
        })
        const data = res.result
        if (data.error) {
          uni.showToast({ title: data.message, icon: 'none', duration: 3000 })
          return
        }
        if (!data.result) {
          uni.showToast({ title: '生成失败，请重试', icon: 'none' })
          return
        }
        this.result = {
          xiaohongshu: { title: '', content: '', tags: [], ...(data.result.xiaohongshu || {}) },
          pengyouquan: data.result.pengyouquan || []
        }
        // 重新生成也保存到历史
        this.saveToHistory()
      } catch (e) {
        console.error('Regenerate failed:', e)
        const msg = e.errMsg || e.message || '生成失败，请重试'
        uni.showToast({ title: msg, icon: 'none', duration: 4000 })
      } finally {
        this.regenerating = false
      }
    },
    tagColor(index) {
      return this.tagColors[index % this.tagColors.length]
    },
    numColor(index) {
      return this.tagColors[index % this.tagColors.length]
    },
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
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' })
        }
      })
    },
    previewImage() {
      uni.previewImage({
        urls: [this.imageUrl],
        current: this.imageUrl
      })
    },
    saveToHistory() {
      try {
        addRecord(this.topic, this.style, this.result, this.imageUrl)
        const list = getHistory()
        if (list.length > 0) {
          this.recordId = list[0].id
          this.isFavorited = list[0].isFavorite
        }
      } catch (e) {
        // silently fail — history is non-critical
      }
    },
    toggleFav() {
      if (!this.recordId) return
      this.isFavorited = toggleFavorite(this.recordId)
      uni.showToast({
        title: this.isFavorited ? '已收藏 ⭐' : '已取消收藏',
        icon: 'none'
      })
    },
    shareCard() {
      this.$refs.shareCard.open({
        topic: this.topic,
        style: this.style
      })
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.redirectTo({ url: '/pages/index/index' })
      }
    }
  },
  onShareAppMessage() {
    return {
      title: '看看我用文案大师生成的文案！✨',
      path: '/pages/index/index'
    }
  }
}
</script>

<style scoped>
.page {
  padding: var(--g-space-8) var(--g-space-4);
  background: var(--g-bg-200);
  min-height: 100vh;
}

/* Error State */
.error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 200rpx;
}
.error-state__icon { font-size: 48px; margin-bottom: var(--g-space-4); }
.error-state__text { font-size: 14px; color: var(--g-gray-700); margin-bottom: var(--g-space-8); }
.error-state__btn { padding: 0 var(--g-space-4); height: 40px; border-radius: var(--g-radius-sm); background: var(--g-primary); display: flex; align-items: center; }
.error-state__btn-text { color: var(--g-bg-100); font-size: 14px; font-weight: 500; }

/* Header */
.header {
  display: flex; flex-direction: column; align-items: center; margin-bottom: var(--g-space-8);
  animation: slideUp 200ms var(--g-easing) both;
}
.header__title { font-size: 20px; font-weight: 600; color: var(--g-primary); text-align: center; letter-spacing: -0.4px; }
.header__underline { width: 64px; height: 3px; border-radius: 2px; margin-top: var(--g-space-2); background: var(--g-accent); }

/* Image Preview */
.image-preview {
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: var(--g-space-6); animation: slideUp 200ms var(--g-easing) 50ms both;
}
.image-preview__img { width: 100px; height: 100px; border-radius: var(--g-radius-md); }
.image-preview__label { margin-top: var(--g-space-1); font-size: 12px; color: var(--g-gray-700); }

/* Section */
.section { margin-bottom: var(--g-space-6); animation: slideUp 200ms var(--g-easing) both; }
.section--pengyouquan { animation-delay: 100ms; }
.section__head { display: flex; align-items: center; margin-bottom: var(--g-space-3); }
.section__dot { width: 8px; height: 8px; border-radius: 50%; margin-right: var(--g-space-2); flex-shrink: 0; }
.section__dot--pink { background: var(--g-accent); }
.section__dot--coral { background: var(--g-gray-700); }
.section__title { font-size: 14px; font-weight: 600; color: var(--g-primary); }

/* Card */
.card {
  background: var(--g-bg-300); border-radius: var(--g-radius-md); padding: var(--g-space-4);
  border: 1px solid var(--g-gray-200);
}
.card--xiaohongshu { border-left: 3px solid var(--g-primary); }
.card--pengyouquan { border-left: 3px solid var(--g-gray-400); }
.card__label { font-size: 12px; color: var(--g-gray-700); display: block; margin-bottom: 2px; margin-top: var(--g-space-3); }
.card__label:first-child { margin-top: 0; }
.card__text { font-size: 14px; color: var(--g-primary); line-height: 1.6; display: block; word-break: break-all; }
.card__text--title { font-size: 16px; font-weight: 600; color: var(--g-primary); line-height: 1.4; }

/* Tags */
.card__tags { display: flex; flex-wrap: wrap; margin-top: var(--g-space-3); gap: var(--g-space-2); }
.card__tag {
  color: var(--g-bg-100); font-size: 12px; padding: 2px 10px;
  border-radius: var(--g-radius-full); font-weight: 500; line-height: 1.6;
}
.card__copy { margin-top: var(--g-space-4); display: flex; justify-content: flex-end; }
.card__copy-text {
  background: var(--g-primary); color: var(--g-bg-100);
  font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: var(--g-radius-full);
  transition: opacity 150ms var(--g-easing);
}
.card__copy-text:active { opacity: 0.8; }

/* Moments */
.pyq-item {
  display: flex; align-items: flex-start; padding: var(--g-space-3) 0;
  border-bottom: 1px dashed var(--g-gray-200);
}
.pyq-item--last { border-bottom: none; }
.pyq-item__num {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  margin-right: var(--g-space-3); margin-top: 2px;
}
.pyq-item__num-text { color: var(--g-bg-100); font-size: 12px; font-weight: 600; }
.pyq-item__text { flex: 1; font-size: 14px; color: var(--g-primary); line-height: 1.6; }
.pyq-item__copy {
  flex-shrink: 0; margin-left: var(--g-space-3); padding: 4px 12px;
  border-radius: var(--g-radius-sm); border: 1px solid var(--g-primary);
  transition: opacity 150ms var(--g-easing);
}
.pyq-item__copy:active { opacity: 0.7; }
.pyq-item__copy-text { color: var(--g-primary); font-size: 12px; font-weight: 500; }

/* Actions */
.actions {
  margin-top: var(--g-space-3); display: flex; flex-direction: column; gap: var(--g-space-3);
  animation: slideUp 200ms var(--g-easing) 200ms both;
}
.action__rainbow {
  width: 100%; border-radius: var(--g-radius-sm);
  background: var(--g-primary);
}
.action__btn {
  display: flex; align-items: center; justify-content: center;
  height: 48px; border-radius: var(--g-radius-sm); background: var(--g-primary);
}
.action__btn:active { opacity: 0.85; }
.action__btn-text { color: var(--g-bg-100); font-size: 14px; font-weight: 500; }

.actions__row { display: flex; gap: var(--g-space-2); }
.actions__fav,
.actions__regenerate {
  flex: 1; height: 40px; border-radius: var(--g-radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500;
  border: 1px solid var(--g-gray-200);
  background: var(--g-bg-100);
  color: var(--g-gray-700);
  transition: all 150ms var(--g-easing);
}
.actions__fav:active,
.actions__regenerate:active { background: var(--g-gray-100); }
.actions__fav--active { border-color: var(--g-accent); background: rgba(0, 172, 150, 0.06); color: var(--g-accent); }

.actions__back { display: flex; align-items: center; justify-content: center; height: 40px; }
.actions__back-text { color: var(--g-gray-700); font-size: 13px; }

/* Animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
