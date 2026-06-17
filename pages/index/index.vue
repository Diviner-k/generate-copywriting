<template>
  <view class="page">
    <!-- Background gradient orbs -->
    <view class="bg-orb bg-orb--1"></view>
    <view class="bg-orb bg-orb--2"></view>
    <view class="bg-orb bg-orb--3"></view>

    <view class="content">
      <!-- Header -->
      <view class="header">
        <text class="header__emoji">🌈</text>
        <text class="header__title">文案大师</text>
        <text class="header__subtitle">一句话生成你的社交文案 ✨</text>
      </view>

      <!-- Input -->
      <view
        class="input-section"
        :class="{ 'input-section--focused': textareaFocused }"
      >
        <textarea
          class="input-section__textarea"
          v-model="topic"
          placeholder="今天吃了什么好吃的？追的剧太上头了..."
          placeholder-style="color: #D4A0B8"
          maxlength="200"
          @focus="textareaFocused = true"
          @blur="textareaFocused = false"
        />
      </view>

      <!-- Style Selection -->
      <view class="style-section">
        <text class="style-section__label">🎨 选个风格吧 ✨</text>
        <view class="style-section__list">
          <StyleSelect
            v-for="s in styles"
            :key="s.value"
            :icon="s.icon"
            :label="s.label"
            :color="s.color"
            :selected="selectedStyle === s.value"
            @select="selectedStyle = s.value"
          />
        </view>
      </view>

      <!-- Generate Button -->
      <view class="action">
        <button
          class="action__btn"
          :class="{ 'action__btn--loading': loading }"
          :disabled="!canGenerate || loading"
          hover-class="action__btn--press"
          @click="generate"
        >
          {{ loading ? '生成中...' : '✨ 一键生成' }}
        </button>
      </view>
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
      textareaFocused: false,
      styles: [
        { value: '高级感', label: '高级感', icon: '✨', color: '#B347FF' },
        { value: '种草',   label: '种草',   icon: '🌿', color: '#5EFF7E' },
        { value: 'emo',    label: 'emo',    icon: '😢', color: '#00E5FF' },
        { value: '可爱',   label: '可爱',   icon: '🎀', color: '#FF2D78' },
        { value: '幽默',   label: '幽默',   icon: '😂', color: '#FFD23F' }
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
        if (!data.result) {
          uni.showToast({ title: '生成失败，请重试', icon: 'none' })
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
  },
  onShareAppMessage() {
    return {
      title: '文案大师 - 一键生成小红书朋友圈文案 🌈',
      path: '/pages/index/index'
    }
  }
}
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #FFFBFC;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Background orbs ── */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.bg-orb--1 {
  width: 420rpx;
  height: 420rpx;
  background: #FF2D78;
  top: -120rpx;
  right: -100rpx;
  filter: blur(200rpx);
  opacity: 0.22;
  animation: float1 10s ease-in-out infinite;
}
.bg-orb--2 {
  width: 360rpx;
  height: 360rpx;
  background: #B347FF;
  bottom: 180rpx;
  left: -120rpx;
  filter: blur(200rpx);
  opacity: 0.2;
  animation: float2 13s ease-in-out infinite;
}
.bg-orb--3 {
  width: 320rpx;
  height: 320rpx;
  background: #00E5FF;
  top: 380rpx;
  right: -80rpx;
  filter: blur(180rpx);
  opacity: 0.2;
  animation: float3 8s ease-in-out infinite 2s;
}

/* ── Content ── */
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 80rpx 32rpx 56rpx;
  flex: 1;
}

/* ── Header ── */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 52rpx;
}
.header__emoji {
  font-size: 80rpx;
  margin-bottom: 8rpx;
}
.header__title {
  font-size: 56rpx;
  font-weight: 900;
  color: #2D1528;
  margin-bottom: 10rpx;
  letter-spacing: 4rpx;
}
.header__subtitle {
  font-size: 28rpx;
  color: #B890A0;
}

/* ── Textarea ── */
.input-section {
  margin-bottom: 36rpx;
  border-radius: 24rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 20rpx rgba(178, 144, 160, 0.12);
  transition: box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.input-section--focused {
  box-shadow: 0 4rpx 28rpx rgba(255, 45, 120, 0.25);
}
.input-section__textarea {
  width: 100%;
  height: 240rpx;
  padding: 28rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #2D1528;
  background: transparent;
  border-radius: 24rpx;
  line-height: 1.6;
}

/* ── Style section ── */
.style-section {
  margin-bottom: 52rpx;
}
.style-section__label {
  font-size: 28rpx;
  font-weight: bold;
  color: #2D1528;
  margin-bottom: 20rpx;
  display: block;
}
.style-section__list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20rpx;
}

/* ── Action button ── */
.action {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20rpx;
}
.action__btn {
  width: 100%;
  height: 100rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #FF2D78, #FF6B4A, #FFD23F, #5EFF7E, #00E5FF, #B347FF);
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: 900;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 45, 120, 0.35);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 2rpx;
}
.action__btn--press {
  transform: scale(0.96);
}
.action__btn--loading {
  animation: pulse 1.4s ease-in-out infinite;
  pointer-events: none;
}
/* Disabled (empty state) — muted version */
.action__btn[disabled] {
  background: #EADBE4;
  color: #C9A8B8;
  box-shadow: none;
}
/* Loading overrides disabled — keep rainbow gradient + pulse */
.action__btn--loading[disabled] {
  background: linear-gradient(135deg, #FF2D78, #FF6B4A, #FFD23F, #5EFF7E, #00E5FF, #B347FF);
  color: #FFFFFF;
  box-shadow: 0 8rpx 32rpx rgba(255, 45, 120, 0.35);
  animation: pulse 1.4s ease-in-out infinite;
}

/* ── Keyframes ── */
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30rpx, -30rpx) scale(1.05); }
  66%      { transform: translate(-20rpx, 20rpx) scale(0.95); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-25rpx, -30rpx) scale(0.95); }
  66%      { transform: translate(20rpx, -40rpx) scale(1.05); }
}
@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(25rpx, 25rpx) scale(1.05); }
  66%      { transform: translate(-20rpx, -25rpx) scale(0.95); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
</style>
