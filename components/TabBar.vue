<!--
 * @Author: KG
 * @Date: 2026-06-26 18:10:35
 * @LastEditors: KG
 * @LastEditTime: 2026-06-26 18:12:43
 * @FilePath: \1111\components\TabBar.vue
 * @Description: 
 * 
-->
<template>
  <view class="tab-bar">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="tab-bar__item"
      @click="switchTab(item)"
    >
      <text class="tab-bar__icon">{{ item.icon }}</text>
      <text
        class="tab-bar__label"
        :class="{ 'tab-bar__label--active': item.selected }"
        >{{ item.text }}</text
      >
    </view>
  </view>
</template>

<script>
export default {
  name: "TabBar",
  data() {
    return {
      tabs: [
        {
          path: "/pages/index/index",
          text: "首页",
          icon: "🏠",
          selected: false,
        },
        {
          path: "/pages/favorites/favorites",
          text: "收藏",
          icon: "⭐",
          selected: false,
        },
        {
          path: "/pages/history/history",
          text: "历史",
          icon: "📋",
          selected: false,
        },
      ],
    };
  },
  created() {
    this.updateSelected();
  },
  methods: {
    updateSelected() {
      const pages = getCurrentPages();
      const current =
        pages.length > 0 ? "/" + pages[pages.length - 1].route : "";
      this.tabs.forEach((t) => {
        t.selected = t.path === current;
      });
    },
    switchTab(item) {
      uni.switchTab({ url: item.path });
    },
  },
};
</script>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--g-bg-200);
  border-top: 1px solid var(--g-gray-200);
  flex-shrink: 0;
}
.tab-bar__item {
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tab-bar__icon {
  font-size: 20px;
  line-height: 1;
}
.tab-bar__label {
  font-size: 11px;
  color: var(--g-gray-600);
  font-weight: 500;
  line-height: 1;
}
.tab-bar__label--active {
  color: var(--g-primary);
  font-weight: 600;
}
</style>
