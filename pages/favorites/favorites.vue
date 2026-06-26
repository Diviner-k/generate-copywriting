<template>
  <view class="page">
    <view v-if="list.length === 0" class="empty">
      <text class="empty__icon">⭐</text>
      <text class="empty__text">还没有收藏过文案</text>
      <view class="empty__btn" @click="goHome">
        <text class="empty__btn-text">去生成一条 ✨</text>
      </view>
    </view>

    <scroll-view
      v-else
      scroll-y
      class="list"
      style="height: calc(100vh - 50px)"
    >
      <view v-for="item in list" :key="item.id" class="card">
        <view class="card__head">
          <view class="card__meta">
            <text
              class="card__style"
              :style="{ color: styleColor(item.style) }"
              >{{ item.style }}</text
            >
            <text class="card__topic">{{ item.topic }}</text>
          </view>
          <text class="card__time">{{ formatTime(item.createdAt) }}</text>
        </view>

        <image
          v-if="item.imageUrl"
          class="card__img"
          :src="item.imageUrl"
          mode="aspectFill"
        />

        <view class="card__preview">
          <text class="card__preview-label">📕 小红书：</text>
          <text class="card__preview-text">{{
            item.result.xiaohongshu.title
          }}</text>
        </view>

        <view class="card__actions">
          <view class="card__action" @click="unfavorite(item)">
            <text>💔</text>
            <text class="card__action-label">取消收藏</text>
          </view>
          <view class="card__action" @click="copyAll(item)">
            <text>📋</text>
            <text class="card__action-label">复制</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <TabBar />
  </view>
</template>

<script>
import TabBar from "@/components/TabBar.vue";
import { getFavorites, toggleFavorite } from "@/utils/storage.js";

export default {
  components: { TabBar },
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    this.loadList();
  },
  onShow() {
    this.loadList();
  },
  methods: {
    loadList() {
      this.list = getFavorites();
    },
    styleColor(style) {
      const map = {
        高级感: "#B347FF",
        种草: "#5EFF7E",
        emo: "#00E5FF",
        可爱: "#FF2D78",
        幽默: "#FFD23F",
        治愈: "#3ED4C4",
        励志: "#FF9500",
        毒舌: "#FF3B30",
        温柔: "#FFB3C1",
        爆款模式: "#FF4500",
        自拍文案: "#FF1493",
        美食文案: "#F5A623",
        旅行文案: "#4A90D9",
        宠物文案: "#F7B731",
        情侣文案: "#E91E63",
        晚安文案: "#6C5CE7",
        学生党文案: "#00B894",
      };
      return map[style] || "#B890A0";
    },
    formatTime(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    unfavorite(item) {
      toggleFavorite(item.id);
      this.loadList();
      uni.showToast({ title: "已取消收藏", icon: "none" });
    },
    copyAll(item) {
      const parts = [
        "【" + item.result.xiaohongshu.title + "】",
        "",
        item.result.xiaohongshu.content,
        "",
        (item.result.xiaohongshu.tags || []).join(" "),
      ];
      if (item.result.pengyouquan && item.result.pengyouquan.length) {
        parts.push("", "— 朋友圈文案 —");
        item.result.pengyouquan.forEach((t, i) => parts.push(i + 1 + ". " + t));
      }
      uni.setClipboardData({
        data: parts.join("\n"),
        success: () => uni.showToast({ title: "已复制", icon: "success" }),
      });
    },
    goHome() {
      uni.switchTab({ url: "/pages/index/index" });
    },
  },
};
</script>

<style scoped>
.page {
  height: 100vh;
  background: var(--g-bg-200);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty__icon {
  font-size: 48px;
  margin-bottom: var(--g-space-4);
}
.empty__text {
  font-size: 14px;
  color: var(--g-gray-700);
  margin-bottom: var(--g-space-6);
}
.empty__btn {
  padding: 0 var(--g-space-4);
  height: 40px;
  border-radius: var(--g-radius-sm);
  background: var(--g-primary);
  display: flex;
  align-items: center;
}
.empty__btn-text {
  color: var(--g-bg-100);
  font-size: 14px;
  font-weight: 500;
}

.list {
  width: 100%;
  padding: var(--g-space-4);
}

.card {
  background: var(--g-bg-300);
  border-radius: var(--g-radius-md);
  padding: var(--g-space-4);
  margin-bottom: var(--g-space-3);
  border: 1px solid var(--g-gray-200);
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--g-space-3);
}
.card__meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}
.card__style {
  font-size: 12px;
  font-weight: 600;
}
.card__topic {
  font-size: 14px;
  color: var(--g-primary);
  font-weight: 600;
}
.card__time {
  font-size: 12px;
  color: var(--g-gray-500);
  flex-shrink: 0;
  margin-left: var(--g-space-3);
}
.card__img {
  width: 60px;
  height: 60px;
  border-radius: var(--g-radius-sm);
  margin-bottom: var(--g-space-3);
}
.card__preview {
  margin-bottom: var(--g-space-3);
}
.card__preview-label {
  font-size: 12px;
  color: var(--g-gray-700);
}
.card__preview-text {
  font-size: 13px;
  color: var(--g-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__actions {
  display: flex;
  border-top: 1px solid var(--g-gray-200);
  padding-top: var(--g-space-3);
  gap: var(--g-space-4);
}
.card__action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.card__action-label {
  color: var(--g-gray-700);
}
</style>
