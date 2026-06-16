<template>
  <view
    class="style-card"
    :class="{ 'style-card--selected': selected }"
    :style="cardStyle"
    @click="$emit('select')"
  >
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
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
        borderColor: this.color
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
  width: 180rpx;
  height: 160rpx;
  border-radius: 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #F0E8ED;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.style-card:active {
  transform: scale(0.95);
}

.style-card--selected {
  border-width: 3rpx;
  transform: translateY(-4rpx);
}

.style-card__icon {
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.style-card__label {
  font-size: 28rpx;
  font-weight: bold;
  color: #2D1528;
}
</style>
