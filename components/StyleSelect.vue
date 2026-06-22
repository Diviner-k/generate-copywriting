<template>
  <view
    class="style-card"
    :class="{ 'style-card--selected': selected }"
    :style="cardStyle"
    @click="$emit('select')"
  >
    <view v-if="selected" class="style-card__check" :style="{ background: color }">✓</view>
    <text class="style-card__icon" :style="{ color: color }">{{ icon }}</text>
    <text class="style-card__label">{{ label }}</text>
  </view>
</template>

<script>
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  }
}

export default {
  name: 'StyleSelect',
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    selected: { type: Boolean, default: false },
    color: { type: String, required: true }
  },
  computed: {
    cardStyle() {
      if (!this.selected) return {}
      const { r, g, b } = hexToRgb(this.color)
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.22)`,
        borderColor: this.color,
        boxShadow: `0 6rpx 24rpx rgba(${r}, ${g}, ${b}, 0.35)`
      }
    }
  }
}
</script>

<style scoped>
.style-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 170rpx;
  height: 148rpx;
  border-radius: 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0E8ED;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.style-card:active {
  transform: scale(0.95);
}

.style-card--selected {
  border-width: 4rpx;
  border-style: solid;
  transform: scale(1.06);
}

/* ✓ checkmark badge */
.style-card__check {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #FFFFFF;
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  z-index: 2;
}

.style-card__icon {
  font-size: 48rpx;
  margin-bottom: 6rpx;
}

.style-card__label {
  font-size: 26rpx;
  font-weight: bold;
  color: #2D1528;
}
</style>
