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
        <button class="actions__share" open-type="share">
          <text class="actions__share-text">📤 分享给朋友</text>
        </button>
        <view class="action__rainbow">
          <view class="action__btn" @click="goBack">
            <text class="action__btn-text">🔄 再生成一条</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
export default {
  data() {
    return {
      hasError: false,
      result: {
        xiaohongshu: { title: '', content: '', tags: [] },
        pengyouquan: []
      },
      tagColors: ['#FF2D78', '#B347FF', '#00E5FF', '#FF6B4A', '#5EFF7E']
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
    }
  },
  methods: {
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
/* ===== Design Tokens ===== */
/* Hot Pink: #FF2D78, Coral: #FF6B4A, Sunny: #FFD23F, Lime: #5EFF7E, Cyan: #00E5FF, Purple: #B347FF */
/* Bg: #FFFBFC, Text: #2D1528, Subtext: #B890A0, Card bg: #FFFFFF, Success: #5EFF7E */

.page {
  padding: 40rpx 32rpx;
  background: #FFFBFC;
  min-height: 100vh;
}

/* ===== Error State ===== */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}
.error-state__icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.error-state__text {
  font-size: 28rpx;
  color: #B890A0;
  margin-bottom: 48rpx;
}
.error-state__btn {
  padding: 20rpx 48rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #FF2D78, #B347FF);
}
.error-state__btn-text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
}

/* ===== Celebration Header ===== */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.header__title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2D1528;
  text-align: center;
}
.header__underline {
  width: 200rpx;
  height: 6rpx;
  border-radius: 3rpx;
  margin-top: 12rpx;
  background: linear-gradient(90deg, #FF2D78, #FF6B4A, #FFD23F, #5EFF7E, #00E5FF, #B347FF);
}

/* ===== Section ===== */
.section {
  margin-bottom: 36rpx;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.section--pengyouquan {
  animation-delay: 0.1s;
}

.section__head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.section__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  flex-shrink: 0;
}
.section__dot--pink {
  background: #FF2D78;
}
.section__dot--coral {
  background: #FF6B4A;
}
.section__title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2D1528;
}

/* ===== Card ===== */
.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 45, 120, 0.08);
}
.card--xiaohongshu {
  border-left: 6rpx solid #FF2D78;
}
.card--pengyouquan {
  border-left: 6rpx solid #FF6B4A;
}

/* --- 小红书 Card --- */
.card__label {
  font-size: 24rpx;
  color: #B890A0;
  display: block;
  margin-bottom: 6rpx;
  margin-top: 20rpx;
}
.card__label:first-child {
  margin-top: 0;
}
.card__text {
  font-size: 28rpx;
  color: #2D1528;
  line-height: 1.8;
  display: block;
  word-break: break-all;
}
.card__text--title {
  font-size: 34rpx;
  font-weight: bold;
  color: #2D1528;
  line-height: 1.5;
}

/* Tags */
.card__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20rpx;
  gap: 12rpx;
}
.card__tag {
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
  line-height: 1.6;
}

/* Copy button (gradient pill) */
.card__copy {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
}
.card__copy-text {
  background: linear-gradient(135deg, #FF2D78, #B347FF);
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: bold;
  padding: 14rpx 32rpx;
  border-radius: 40rpx;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card__copy-text:active {
  transform: scale(0.92);
}

/* --- 朋友圈 Card --- */
.pyq-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx dashed #F0E0E8;
}
.pyq-item--last {
  border-bottom: none;
}
.pyq-item__num {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16rpx;
  margin-top: 2rpx;
}
.pyq-item__num-text {
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: bold;
}
.pyq-item__text {
  flex: 1;
  font-size: 28rpx;
  color: #2D1528;
  line-height: 1.8;
}
.pyq-item__copy {
  flex-shrink: 0;
  margin-left: 16rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid #FF2D78;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pyq-item__copy:active {
  transform: scale(0.92);
}
.pyq-item__copy-text {
  color: #FF2D78;
  font-size: 22rpx;
  font-weight: 600;
}

/* ===== Bottom Action ===== */
.actions {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

/* Share button */
.actions__share {
  width: 100%;
  height: 90rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #FF2D78, #B347FF);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 45, 120, 0.25);
}
.actions__share::after {
  border: none;
}
.actions__share:active {
  transform: scale(0.96);
}
.actions__share-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
}

/* Rainbow border wrapper via gradient background */
.action__rainbow {
  width: 100%;
  border-radius: 50rpx;
  padding: 3rpx;
  background: linear-gradient(90deg, #FF2D78, #FF6B4A, #FFD23F, #5EFF7E, #00E5FF, #B347FF);
  animation: rainbowShimmer 3s linear infinite;
  background-size: 300% 100%;
}
.action__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90rpx;
  border-radius: 50rpx;
  background: #FFFFFF;
}
.action__btn:active {
  transform: scale(0.97);
}
.action__btn-text {
  color: #FF2D78;
  font-size: 32rpx;
  font-weight: bold;
}

/* ===== Animations ===== */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rainbowShimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 300% 50%;
  }
}
</style>
