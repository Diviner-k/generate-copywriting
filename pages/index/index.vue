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
        :class="{ 'action__btn--disabled': !canGenerate || loading }"
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
