<template>
  <view
    class="style-card"
    :class="{ 'style-card--selected': selected }"
    :style="cardStyle"
    @click="$emit('select')"
  >
    <view v-if="selected" class="style-card__check">✓</view>
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
    selected: { type: Boolean, default: false },
    color: { type: String, required: true }
  },
  computed: {
    cardStyle() {
      if (!this.selected) return {}
      return {
        backgroundColor: 'var(--g-bg-400)',
        borderColor: 'var(--g-primary)',
        boxShadow: 'var(--g-shadow-card)'
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
  width: 80px;
  height: 72px;
  border-radius: var(--g-radius-sm);
  background: var(--g-bg-400);
  border: 1px solid var(--g-gray-200);
  flex-shrink: 0;
  transition: all 150ms var(--g-easing);
  position: relative;
}

.style-card:active {
  background: var(--g-gray-100);
}

.style-card--selected {
  border-width: 2px;
  transform: scale(1.04);
}

.style-card__check {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--g-primary);
  color: var(--g-bg-100);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.style-card__icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.style-card__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--g-primary);
}
</style>
