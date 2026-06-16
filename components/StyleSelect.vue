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
