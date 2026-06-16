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
